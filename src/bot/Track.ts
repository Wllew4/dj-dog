import { unlink } from 'fs';
import { Fetcher, YoutubeUrlFetchStrategy } from '../fetcher/Fetcher';

//  Needs download() code

interface TrackInfo{
    path: string,
    duration: number
}

class Track
{
  public trackInfo: Promise<TrackInfo>;

  public constructor(
    public url: string
  )
  {
    this.trackInfo = this.download(url);
  }

  private async download(url: string): Promise<TrackInfo>
  {
    const fetcher = new Fetcher(new YoutubeUrlFetchStrategy());
    return fetcher.fetch(url);
  }

  public async delete()
  {
    unlink((await this.trackInfo).path, e => {
      if(e) console.error(e);
    });
  }
};

export { Track, TrackInfo };