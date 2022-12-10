import getSecrets from '../Secrets'
import fetch from 'cross-fetch'
import Track from '../music/Track'
import YTSearchInfo from './SearchInfo'
import Log from '../Log'

export default class YTSearchTrack {
	/**
	 * Find a Track based on a query
	 * @param query Search term or URL to video
	 * @returns the requested Track, or null if not found
	 */
	public static async getTrack(query: string): Promise<Track | null> {
		let url: string | null
		if (YTSearchTrack.isValidUrl(query)) url = query
		else url = await YTSearchTrack.search(query)

		if (url == null) return null

		return await Track.new(url, YTSearchInfo.getInfo(url))
	}

	private static async search(query: string): Promise<string | null> {
		Log.logSystem(`Searching for: "${query}"...`)

		const { youtube_api_key } = await getSecrets()
		const res = await fetch(
			`//www.googleapis.com/youtube/v3/search?key=${youtube_api_key}&q=${query}&maxResults=1&type=video&videoCategoryId=10&safeSearch=none`,
			{ method: 'GET' }
		)

		if (!res.ok) {
			Log.logSystemErr('Bad response from server:')
			Log.logSystemErr(res)
			return null
		}

		const resJson = await res.json()

		const searchResult = resJson.items[0]
		if (!searchResult) {
			Log.logSystem(`No video found for query: "${query}"`)
			return null
		}
		const url = `https://www.youtube.com/watch?v=${searchResult.id.videoId}`
		Log.logSystem(`Found: "${url}"`)
		return url
	}

	private static isValidUrl(url: string): boolean {
		try {
			new URL(url)
		} catch (err) {
			return false
		}
		return true
	}
}
