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
	
	private timeoutTime: number = 60;
	private timeout: NodeJS.Timeout;

	private audioManager: AudioManager;
	private connection: VoiceConnection;

	private controller: AbortController;
	private signal: AbortSignal;
	// Viewmodel for the "Currently playing" reply message
	public replyVM?: ReplyVM;

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
			{
				this.update();
			}
		});
	}

	/**
	 * Call to change songs
	 */
	private async update()
	{
		// If the queue is empty, start the disconnect timer
		// and do not progress to next track
		// Otherwise, end potential existing timers
		if(this.queue.isEmpty())
		{
			this.startTimeout();
			return;
		}
		else
			clearTimeout(this.timeout);
		
		// Currently playing music, don't start next song
		if(!this.audioManager.isIdle())
			return;
			
		// Play next song
		const track = this.queue.advance();
		if(!track)
			return;
		this.audioManager.stream(track);
		
		// Update logs and VM
		console.log(`Now playing: ${(await track.info).title}`);
		track.info.then(()=>{
			if (this.replyVM) {
				this.replyVM.track = track;
			}
		});
	}
	
	/**
	 * Start the countdown to bot disconnection
	 */
	private startTimeout()
	{
		this.timeout = setTimeout(() => {
			this.dj.endSession(this);
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
		if (SearchManager.isValidUrl(query)) track = new Track(query);
		else
		{
			let song = await SearchManager.search(query);
			if(song != null)
			{
				track = new Track(song);
			
				this.queue.add(track);
				this.update();
			}
			else return false;
		}
		return true;
	}

	public remove(i: number): Track
	{
		return this.queue.remove(i);
	}

	/**
	 * Gets a list of the queued up tracks
	 * @returns The queued up tracks
	 */
	public async showQueue(): Promise<string>
	{
		let o: string = `\`\`\`${this.queue.length()} items in queue:\n`;
		for(let i = 0; i < this.queue.length(); i++)
		{
			o += `${i+1}. ${(await this.queue.at(i).info).title}\n`;
		}
		o += `\`\`\``;
		return o;
	}

	/**
	 * Skips the current song
	 * @returns true if there is another track, false if the queue is empty
	 */
	public async skip(): Promise<boolean>
	{
		this.audioManager.stop();
		return this.queue.isEmpty();
	}

	/**
	 * Pauses/unpauses playback
	 * @returns true if paused, false if unpaused
	 */
	public async pause(): Promise<boolean>
	{
		return this.audioManager.pause();
	}
};