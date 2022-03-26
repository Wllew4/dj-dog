import Track from './Track';

import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	NoSubscriberBehavior,
	StreamType } from '@discordjs/voice';
import { exec } from 'youtube-dl-exec';
import { Converter } from 'ffmpeg-stream';
import { ExecaChildProcess } from 'execa';
import { Readable } from 'stream';

export default class AudioManager
{
	private downloader?: ExecaChildProcess;
	public audioPlayer: AudioPlayer;
	
	private paused: boolean = false;

	/**
	 * Constructs a new AudioManager object
	 * Handles audio playback for a session
	 */
	public constructor()
	{
		this.audioPlayer = createAudioPlayer({	behaviors: {
			noSubscriber: NoSubscriberBehavior.Pause,
		}});
		
		this.audioPlayer.on('error', console.error );

	}

	/**
	 * Gets the track from the top of the queue and streams it
	 */
	public async stream(track: Track) {
		try{
			// if audio-only formats are offered, download the highest quality one
			// else fall back to the worst video+audio format
			// output to process stdout so we can stream this
			this.downloader = exec(track.url,
				{
					format:'bestaudio/worst',
					output:'-',
					noCheckCertificate:true,
					callHome:false,
					forceIpv4:true
				});
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
	 * Prepares a new converter
	 * @param mediaStream The incoming audio/video stream
	 * @returns The converted audio stream
	 */
	private convert(mediaStream:Readable): Readable {
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
	 * @returns true if anything is currently playing
	 */
	public isIdle(): boolean
	{
		return this.audioPlayer.state.status == AudioPlayerStatus.Idle;
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

	/**
	 * Stops playback
	 */
	public stop()
	{
		this.audioPlayer.stop();
		this.killDownloader();
	}

	/**
	 * Stop streaming from YT-DL
	 */
	private killDownloader(): void {
		if (this.downloader && !this.downloader.killed) {
			this.downloader.kill('SIGTERM');
		}
	}
};