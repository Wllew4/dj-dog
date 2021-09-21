import { unlink } from 'fs';
import youtubedl, { YtResponse } from 'youtube-dl-exec';

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
    this.info = youtubedl(this.url, { dumpSingleJson:true });
  }
};

export default Track;