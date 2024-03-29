import Track from '../music/Track'

import {
	AudioPlayer,
	AudioPlayerStatus,
	createAudioPlayer,
	NoSubscriberBehavior,
	joinVoiceChannel,
	entersState,
	VoiceConnectionStatus,
	VoiceConnection,
} from '@discordjs/voice'
import { StageChannel, VoiceChannel } from 'discord.js'
import YTAudioStream from '../yt/Stream'
import Log from '../Log'

export default class Voice {
	private _paused: boolean = false
	public get paused() {
		return this._paused
	}

	private audioPlayer: AudioPlayer
	private ytAudioStream: YTAudioStream = new YTAudioStream(this)

	private connection: VoiceConnection
	private controller: AbortController
	private signal: AbortSignal

	/**
	 * Constructs a new AudioManager object
	 * Handles audio playback for a session
	 */
	public constructor(public vChannel: VoiceChannel | StageChannel) {
		this.audioPlayer = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		})

		this.audioPlayer.on('error', Log.logSystemErr)

		this.connection = joinVoiceChannel({
			channelId: this.vChannel.id,
			guildId: this.vChannel.guild.id,
			adapterCreator: this.vChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		})
		this.connection.subscribe(this.audioPlayer)
		this.controller = new AbortController()
		this.signal = this.controller.signal
	}

	public async join() {
		await entersState(
			this.connection,
			VoiceConnectionStatus.Ready,
			this.signal
		)
	}

	/**
	 * Streams a track
	 * @param track the track to stream
	 */
	public stream(track: Track) {
		const resource = this.ytAudioStream.createResource(track)
		this.audioPlayer.play(resource)
	}

	/**
	 * @returns true if anything is currently playing
	 */
	public isIdle(): boolean {
		return this.audioPlayer.state.status == AudioPlayerStatus.Idle
	}

	/**
	 * @returns true if anything is currently playing
	 */
	public isBuffering(): boolean {
		return this.audioPlayer.state.status == AudioPlayerStatus.Buffering
	}

	/**
	 * Pauses playback
	 * @returns true if now paused, false if now unpaused
	 */
	public pause(): boolean {
		if (this.paused) {
			this._paused = false
			this.audioPlayer.unpause()
		} else {
			this._paused = true
			this.audioPlayer.pause()
		}
		return this.paused
	}

	/**
	 * Cut off current song playback
	 */
	public finishSong() {
		this.audioPlayer.stop()
	}

	/**
	 * Kill VC connection
	 */
	public kill() {
		this.finishSong()
		this.ytAudioStream.killDownloader()
		this.connection.destroy()
	}
}
