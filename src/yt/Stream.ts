import Track from '../music/Track'
import {
	createAudioResource,
	StreamType,
	AudioResource,
} from '@discordjs/voice'
import { exec } from 'yt-dlp-exec'
import { Converter } from 'ffmpeg-stream'
import { ExecaChildProcess, node, sync } from 'execa'
import { Readable } from 'stream'
import Log from '../Log'
import Voice from '../bot/Voice'

export default class YTAudioStream {
	private downloader?: ExecaChildProcess
	private voice: Voice

	constructor(voice: Voice) {
		this.voice = voice
	}

	/**
	 * Upgrade yt-dlp
	 */
	public static updateYTDLP(): string {
		node('./node_modules/yt-dlp-exec/scripts/postinstall.js')
		sync('chmod', ['+x', './node_modules/yt-dlp-exec/bin/yt-dlp'])
		return sync('./node_modules/yt-dlp-exec/bin/yt-dlp', ['--version'])
			.stdout
	}

	/**
	 * Create an AudioResource for a Track
	 * @param track song to download and stream
	 * @returns AudioResource
	 */
	public createResource(track: Track): AudioResource<null> {
		// if audio-only formats are offered, download the highest quality one
		// else fall back to the worst video+audio format
		// output to process stdout so we can stream this
		this.downloader = exec(track.url, {
			format: 'bestaudio/worst',
			output: '-',
			noCheckCertificate: true,
			forceIpv4: true,
		})
		if (!this.downloader.stdout)
			throw Error('Download process has no stdout???')
		// no joke, downloader will quit if nobody listens to its errors :(
		// Logging here outputs transferred buffers lol
		this.downloader.stderr?.on('data', (e) => {})

		const audioStream = this.convert(this.downloader.stdout, track)
		return createAudioResource(audioStream, {
			inputType: StreamType.OggOpus,
		})
	}

	/**
	 * Stop streaming
	 */
	public killDownloader(): void {
		if (this.downloader && !this.downloader.killed) {
			this.downloader.kill('SIGTERM')
		}
	}

	/**
	 * Prepares a new converter
	 * @param mediaStream The incoming audio/video stream
	 * @returns The converted audio stream
	 */
	private convert(mediaStream: Readable, track: Track): Readable {
		const converter = new Converter()
		const output = converter.createOutputStream({
			'f': 'opus',
			'acodec': 'libopus',
			'b:a': 128000,
			'application': 'audio',
		})
		mediaStream.pipe(converter.createInputStream({}))
		converter.run().catch(() => {
			Log.logSystemErr('Conversion failed, updating yt-dlp...')
			const version = YTAudioStream.updateYTDLP()
			Log.logSystemErr(`yt-dlp updated to ${version}`)
			this.voice.stream(track)
		})
		return output
	}
}
