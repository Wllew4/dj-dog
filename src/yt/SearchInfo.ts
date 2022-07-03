import youtubedl, { YtResponse } from 'yt-dlp-exec';

export default class YTSearchInfo
{
	public static async getInfo(url: string): Promise<YtResponse>
	{
		return youtubedl(url, { dumpSingleJson:true, noCheckCertificate:true, forceIpv4:true });
	}
}
