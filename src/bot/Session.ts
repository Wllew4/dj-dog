import AudioManager from './AudioManager';
import Track from './Track';
import SearchManager from './SearchManager';

import {
	Message,
	StageChannel,
	VoiceChannel
} from 'discord.js';
import {
	joinVoiceChannel,
	entersState,
	VoiceConnectionStatus,
	VoiceConnection,
	AudioPlayerStatus
} from '@discordjs/voice';
import DJDog from './DJDog';
import ReplyVM from './ReplyVM';
import { APIMessage } from 'discord.js/node_modules/discord-api-types';
import Queue from './Queue';

export default class Session
{
	public queue: Queue<Track>;
	public currentTrack: Track | undefined;
	public bPaused: boolean = false;

	private timeoutTime: number = 60;
	private timeout: NodeJS.Timeout;

	// Viewmodel for the "Currently playing" reply message
	public replyVM?: ReplyVM;

	private audioManager: AudioManager;

	private connection: VoiceConnection;
	private controller: AbortController;
	private signal: AbortSignal;

	async linkVM(pReply: Promise<Message|APIMessage>) {
		const reply = await pReply;
		if (reply instanceof Message) {
			this.replyVM = new ReplyVM(reply);
		}
	}

	/**
	 * Starts a new session.
	 * @param vChannel The voice channel associated with the session
	 */
	constructor(public vChannel: VoiceChannel | StageChannel, public dj: DJDog)
	{
		this.queue = new Queue<Track>();

		this.timeout = setTimeout(()=>{},0);
		this.startTimeout();

		this.connection = joinVoiceChannel({
			channelId: this.vChannel.id,
			guildId: this.vChannel.guild.id,
			adapterCreator: this.vChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false
		});

		this.audioManager = new AudioManager();
		this.connection.subscribe(this.audioManager.audioPlayer);

		this.controller = new AbortController();
		this.signal = this.controller.signal;

		// @ts-ignore
		// not sure why this was giving an intellisense error,
		// and there is no compiler error
		this.audioManager.audioPlayer.on('stateChange', (oldState, newState) => {
			if(newState.status == AudioPlayerStatus.Idle && oldState.status != AudioPlayerStatus.Idle)
				this.advanceSong();
		});
	}

	/**
	 * Call to change songs
	 */
	private async advanceSong()
	{
		// If the queue is empty, start the disconnect timer
		// and do not progress to next track
		// Otherwise, end potential existing timers
		if(this.queue.isEmpty())
		{
			this.startTimeout();
			this.currentTrack = undefined;
			this.updateVM();
			return;
		}
		else
			clearTimeout(this.timeout);

		// Currently playing music, don't start next song
		if(!this.audioManager.isIdle())
			return;

		// Play next song
		this.currentTrack = this.queue.advance();
		if(this.currentTrack == undefined)
			return;
		this.audioManager.stream(this.currentTrack);

		console.log(`Now playing: ${(await this.currentTrack.info).title}`);
		this.updateVM();
	}

	private updateVM()
	{
		if(this.replyVM)
		{
			this.replyVM.track = this.currentTrack;
			this.replyVM.queue = this.queue;
			this.replyVM.playing = !this.bPaused;
		}
	}

	/**
	 * Start the countdown to bot disconnection
	 */
	private startTimeout()
	{
		this.timeout = setTimeout(() => {
			this.dj.endSession(this);
			this.replyVM?.remove();
		}, this.timeoutTime * 1000);
	}

	/**
	 * Connects the bot to its voice channel
	 */
	public async join()
	{
		try
		{
			await entersState(this.connection, VoiceConnectionStatus.Ready, this.signal);
		}
		catch (e)
		{
			this.controller.abort();
			console.error(e);
		}
	}

	/**
	 * Disconnects the bot from its voice channel
	 */
	public async leave()
	{
		try
		{
			this.audioManager.stop();
			this.connection.destroy();
		}
		catch (e)
		{
			console.error(e);
		}
	}

	/**
	 * Adds a song to the queue
	 * @param query The url/query for the song to queue up
	 */
	public async play(query: string): Promise<boolean>
	{
		let track: Track | null;
		if (SearchManager.isValidUrl(query))
			track = new Track(query);
		else
		{
			let song = await SearchManager.search(query);
			if(song == null)
				return false;
			track = new Track(song);
		}

		this.queue.add(track);
		this.advanceSong();
		this.updateVM();

		return true;
	}

	/**
	 * Remove a song from the queue
	 * @param i Index for removal
	 * @returns the Track removed
	 */
	public remove(i: number): Track
	{
		let out = this.queue.remove(i);
		this.updateVM();
		return out;
	}

	/**
	 * Skips the current song
	 * @returns true if there is another track, false if the queue is empty
	 */
	public async skip(): Promise<boolean>
	{
		this.audioManager.stop();
		this.updateVM();
		return !this.queue.isEmpty();
	}

	/**
	 * Pauses/unpauses playback
	 * @returns true if paused, false if unpaused
	 */
	public async pause(): Promise<boolean>
	{
		this.bPaused = !this.bPaused;
		this.updateVM();
		return this.audioManager.pause();
	}
};