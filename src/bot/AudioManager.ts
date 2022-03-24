import Track from './Track';
import Session from './Session';
import Queue from "./Queue";

import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	NoSubscriberBehavior,
	StreamType } from '@discordjs/voice';
import { raw as youtubedlraw } from 'youtube-dl-exec';
import { Converter } from 'ffmpeg-stream';
import { ExecaChildProcess } from 'execa';
import { Readable } from 'stream';

export default class AudioManager
{
	private timeoutTime: number = 60;
	private timeout: NodeJS.Timeout;

	private downloader?: ExecaChildProcess;
	public audioPlayer: AudioPlayer;
	
	private queue: Queue<Track>;
	private paused: boolean = false;

	/**
	 * Constructs a new AudioManager object
	 * Handles audio playback for a session
	 */
	public constructor(private session: Session)
	{
		this.queue = session.queue;
		this.timeout = setTimeout(()=>{},0);
		this.startTimeout();

		this.audioPlayer = createAudioPlayer({	behaviors: {
			noSubscriber: NoSubscriberBehavior.Pause,
		}});
		
		this.audioPlayer.on('error', console.error );

		// @ts-ignore
		// not sure why this was giving an intellisense error,
		// and there is no compiler error
		this.audioPlayer.on('stateChange', (oldState, newState) => {
			if(newState.status == AudioPlayerStatus.Idle && oldState.status != AudioPlayerStatus.Idle)
			{
				//Track concluded
				// this.startTimeout();
				this.checkQueue();
			}
		});
	}

	private startTimeout()
	{
		this.timeout = setTimeout(() => {
			this.session.dj.endSession(this.session);
		}, this.timeoutTime * 1000);
	}

	/**
	 * Prepares a new converter
	 * @param mediaStream The incoming audio/video stream
	 * @returns The converted audio stream
	 */
	convert(mediaStream:Readable): Readable {
		const converter = new Converter();
		const output = converter.createOutputStream({
			f:'opus',
			acodec: 'libopus',
			'b:a': 128000,
			application:'audio'
		});
		mediaStream.pipe(converter.createInputStream({}));
		converter.run();
		return output;
	}

	/**
	 * Checks if there's a new song to start streaming
	 */
	public async checkQueue()
	{
		if(this.audioPlayer.state.status != AudioPlayerStatus.Idle)
		{
			clearTimeout(this.timeout);
			//currently playing music
			return;
		}
		if(this.queue.length() == 0)
			//queue is empty
			return;
		this.stream();
	}

	/**
	 * Gets the track from the top of the queue and streams it
	 */
	public async stream() {
		clearTimeout(this.timeout);
		const track = this.queue.advance();
		if(!track)
			return;
		console.log(`Now playing: ${(await track.info).title}`);
		track.info.then(()=>{
			if (this.session.replyVM) {
				this.session.replyVM.track = track;
			}
		});

		try{
			// if audio-only formats are offered, download the highest quality one
			// else fall back to the worst video+audio format
			// output to process stdout so we can stream this
			this.downloader = youtubedlraw(track.url, {f:'bestaudio/worst', o:'-', noCheckCertificate:true, noCallHome:true, forceIpv4:true});
			if (!this.downloader.stdout) throw Error('Download process has no stdout???');
			// no joke, downloader will quit if nobody listens to its errors :(
			// Logging here outputs transferred buffers lol
			this.downloader.stderr?.on('data', (e)=>{ /* console.log(e) */});
			const audioStream = this.convert(this.downloader.stdout);
			const resource = createAudioResource(audioStream, { inputType: StreamType.OggOpus });
			this.audioPlayer.play(resource);
		}
		catch(err){
			console.error(err);
		}
	}

	/**
	 * Pauses playback
	 * @returns true if now paused, false if now unpaused
	 */
	public pause(): boolean
	{
		if(this.paused)
		{
			this.paused = false;
			this.audioPlayer.unpause();
		}
		else
		{
			this.paused = true;
			this.audioPlayer.pause();
		}
		return this.paused;
	}

	private killDownloader(): void {
		if (this.downloader && !this.downloader.killed) {
			this.downloader.kill('SIGTERM');
		}
	}

	/**
	 * Stops playback
	 * @returns true if there is another track, false if the queue is empty
	 */
	public async stop(): Promise<boolean> {
		this.audioPlayer.stop();
		this.killDownloader();
		if(this.queue.length() == 0)
			return false;
		else
			return true;
	}
};