import { YtResponse } from 'yt-dlp-exec'

export default class Track {
	/**
	 * Constructs a new track
	 * @param url The song's url
	 */
	public static new(url: string, info: YtResponse): Track {
		return new Track(url, info)
	}

	private constructor(
		public readonly url: string,
		public readonly info: YtResponse
	) {}
}
