import youtubedl, { YtResponse } from 'yt-dlp-exec'

export default class YTSearchInfo {
	public static async getInfo(url: string): Promise<YtResponse | null> {
		let response: Promise<any> = youtubedl(
			url,
			{
				dumpSingleJson: true,
				noCheckCertificate: true,
				forceIpv4: true,
			},
			{ reject: false }
		)
		if ((await response) == 'null') return null // why tf does it return null as a string :(
		return response
	}
}
