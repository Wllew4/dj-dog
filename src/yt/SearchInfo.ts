import youtubedl, { YtResponse } from 'yt-dlp-exec'
import Log from '../Log'

export default class YTSearchInfo {
	public static async getInfo(url: string): Promise<YtResponse | null> {
		Log.logSystem(`Looking up track info for ${url}...`)
		let response: Promise<any> = youtubedl(
			url,
			{
				dumpSingleJson: true,
				noCheckCertificate: true,
				forceIpv4: true,
			},
			{ reject: false }
		)
		if ((await response) == '') {
			Log.logSystemErr(`Failed to load track info for ${url}`)
			return null // why tf does it return null as a string :(
		}
		Log.logSystem(
			`Successfully loaded track info for: ${
				(await response).title
			} | ${url}`
		)
		return response
	}
}
