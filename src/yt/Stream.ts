import Track from '../music/Track'
import {
	createAudioResource,
	StreamType,
	AudioResource,
} from '@discordjs/voice'
import { exec } from 'yt-dlp-exec'
import { Converter } from 'ffmpeg-stream'
import { ExecaChildProcess } from 'execa'
import { Readable } from 'stream'

export default class YTAudioStream {
	public static downloader?: ExecaChildProcess

	public static async createResource(
		track: Track
	): Promise<AudioResource<null>> {
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
		this.downloader.stderr?.on('data', (e) => {
			/* console.log(e) */
		})

		const audioStream = this.convert(this.downloader.stdout)
		return createAudioResource(audioStream, {
			inputType: StreamType.OggOpus,
		})
	}

	/**
	 * Stop streaming
	 */
	public static killDownloader(): void {
		if (this.downloader && !this.downloader.killed) {
			this.downloader.kill('SIGTERM')
		}
	}

	/**
	 * Prepares a new converter
	 * @param mediaStream The incoming audio/video stream
	 * @returns The converted audio stream
	 */
	private static convert(mediaStream: Readable): Readable {
		const converter = new Converter()
		const output = converter.createOutputStream({
			'f': 'opus',
			'acodec': 'libopus',
			'b:a': 128000,
			'application': 'audio',
		})
		mediaStream.pipe(converter.createInputStream({}))
		converter.run()
		return output
	}
}
