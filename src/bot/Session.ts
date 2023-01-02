import Voice from './Voice'
import Track from '../music/Track'
import YTSearchTrack from '../yt/SearchTrack'
import ReplyVM from './ReplyVM'
import Queue from '../music/Queue'
import DJDog from './DJDog'

import { StageChannel, VoiceChannel } from 'discord.js'
import { AudioPlayerStatus } from '@discordjs/voice'
import Log from '../Log'

export default class Session {
	public queue: Queue<Track> = new Queue<Track>()
	public currentTrack: Track | undefined

	private static readonly TIMEOUT_TIME: number = 60
	private timeout: NodeJS.Timeout

	private voice: Voice

	/**
	 * Starts a new session.
	 * @param vChannel The voice channel associated with the session
	 */
	public constructor(
		public vChannel: VoiceChannel | StageChannel,
		private dj: DJDog,
		public replyVM: ReplyVM
	) {
		this.voice = new Voice(vChannel)
		this.voice.join()

		this.timeout = setTimeout(() => {}, 0)
		this.startTimeout()

		// @ts-ignore
		this.voice.audioPlayer.on('stateChange', (oldState, newState) => {
			if (
				newState.status == AudioPlayerStatus.Idle &&
				oldState.status != AudioPlayerStatus.Idle
			)
				this.refreshPlayer()
		})
	}

	/**
	 * Call to change songs
	 */
	private async refreshPlayer() {
		// If the queue is empty, start the disconnect timer
		// and do not progress to next track
		// Otherwise, end potential existing timers
		if (this.queue.isEmpty()) {
			this.startTimeout()
			this.currentTrack = undefined
			this.updateVM()
			return
		} else clearTimeout(this.timeout)

		// Currently playing music, don't start next song
		if (!this.voice.isIdle()) return

		// Play next song
		this.currentTrack = this.queue.advance()
		if (this.currentTrack == undefined) return
		this.voice.stream(this.currentTrack)

		Log.logSystem(
			`Now playing: "${this.currentTrack.info.title}" in channel "${this.vChannel.name}" in server "${this.vChannel.guild.name}"`
		)
		this.updateVM()
	}

	private async updateVM() {
		this.replyVM.render(this.currentTrack, this.queue, this.voice.paused)
	}

	/**
	 * Start the countdown to bot disconnection
	 */
	private startTimeout() {
		this.timeout = setTimeout(async () => {
			this.dj.endSession(this)
		}, Session.TIMEOUT_TIME * 1000)
	}

	/**
	 * Disconnects the bot from its voice channel
	 */
	public async leave() {
		this.voice.kill()
		this.replyVM.remove()
	}

	/**
	 * Adds a song to the queue
	 * @param query The url/query for the song to queue up
	 */
	public async play(query: string): Promise<string> {
		let track: Track | null = await YTSearchTrack.getTrack(query)
		if (track == null) return `Could not find a video for query: ${query}`

		this.queue.add(track)
		this.refreshPlayer()
		this.updateVM()

		return `Added [${track.info.title}](${track.url}) to the queue.`
	}

	/**
	 * Remove a song from the queue
	 * @param i Index for removal
	 * @returns the Track removed
	 */
	public async remove(i: number): Promise<string> {
		let removed = this.queue.remove(i - 1)
		this.updateVM()
		if (removed) return `Removed ${removed.info.title} from the queue!`
		return `Failed to remove index ${i} from the queue`
	}

	/**
	 * Skips the current song
	 * @returns true if there is another track, false if the queue is empty
	 */
	public async skip(): Promise<string> {
		if (this.voice.isIdle()) return 'The queue is empty!'
		this.voice.finishSong()
		this.updateVM()
		return 'Skipped!'
	}

	/**
	 * Pauses/unpauses playback
	 * @returns true if paused, false if unpaused
	 */
	public async pause(): Promise<string> {
		if (this.voice.isIdle() || this.voice.isBuffering())
			return 'Not currently playing anything'
		const paused = this.voice.pause()
		this.updateVM()
		return (paused ? 'Paused' : 'Resumed') + ' playback.'
	}
}
