import youtubedl, { YtResponse } from 'yt-dlp-exec';

class Track
{
	public readonly info: Promise<YtResponse>;
	
	/**
	 * Constructs a new track
	 * @param url The song's url
	 */
	public constructor(
		public url: string
	)
	{
		this.info = youtubedl(this.url, { dumpSingleJson:true, noCheckCertificate:true, forceIpv4:true });
	}
};

export default Track;