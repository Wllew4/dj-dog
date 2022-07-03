import AudioManager from './AudioManager';
import Track from './Track';
import YouTubeSearchTrack from '../yt/SearchTrack';
import ReplyVM from './ReplyVM';
import Queue from './Queue';

import {
	StageChannel,
	VoiceChannel
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

interface IEndFunction
{
	(session: Session): void
}

export default class Session
{
	public queue: Queue<Track>;
	public currentTrack: Track | undefined;

	private timeoutTime: number = 60;
	private timeout: NodeJS.Timeout;

	private audioManager: AudioManager;

	/**
	 * Starts a new session.
	 * @param vChannel The voice channel associated with the session
	 */
	public constructor(public vChannel: VoiceChannel | StageChannel, private endFunction: IEndFunction, public replyVM: ReplyVM)
	{
		this.queue = new Queue<Track>();

		this.timeout = setTimeout(()=>{},0);
		this.startTimeout();

		this.audioManager = new AudioManager(vChannel);
		this.audioManager.join();

		// @ts-ignore
		this.audioManager.audioPlayer.on("stateChange", (oldState, newState) => {
			if(newState.status == AudioPlayerStatus.Idle && oldState.status != AudioPlayerStatus.Idle)
				this.refreshPlayer();
		})
	}

	/**
	 * Call to change songs
	 */
	private async refreshPlayer()
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

	private async updateVM()
	{
		this.replyVM.render(this.currentTrack, this.queue, this.audioManager.paused);
	}

	/**
	 * Start the countdown to bot disconnection
	 */
	private startTimeout()
	{
		this.timeout = setTimeout(async () => {
			this.endFunction(this);
			this.replyVM.remove();
		}, this.timeoutTime * 1000);
	}

	/**
	 * Disconnects the bot from its voice channel
	 */
	public async leave()
	{
		try
		{
			this.audioManager.kill();
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
	public async play(query: string): Promise<string>
	{
		let track: Track | null = await YouTubeSearchTrack.getTrack(query);
		if(track == null)
			return `Could not find a video for query: ${query}`;

		this.queue.add(track);
		this.refreshPlayer();
		this.updateVM();
		
		return `Added [${query}](${track.url}) to the queue.`;
	}

	/**
	 * Remove a song from the queue
	 * @param i Index for removal
	 * @returns the Track removed
	 */
	public async remove(i: number): Promise<string>
	{
		let removed = this.queue.remove(i-1);
		this.updateVM();
		if(removed)
			return `Removed ${(await removed.info).title} from the queue!`;
		return `Failed to remove index ${i} from the queue`;
	}

	/**
	 * Skips the current song
	 * @returns true if there is another track, false if the queue is empty
	 */
	public async skip(): Promise<string>
	{
		if(this.audioManager.isIdle())
			return 'The queue is empty!';
		this.audioManager.finishSong();
		this.updateVM();
		return 'Skipped!';
	}

	/**
	 * Pauses/unpauses playback
	 * @returns true if paused, false if unpaused
	 */
	public async pause(): Promise<string>
	{
		if(this.audioManager.isIdle() || this.audioManager.isBuffering())
			return 'Not currently playing anything';
		const paused = this.audioManager.pause();
		this.updateVM();
		return (paused ? 'Paused': 'Resumed') + ' playback.';
	}
};
