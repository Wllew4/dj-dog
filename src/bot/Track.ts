import { unlink } from 'fs';
import { Fetcher, YoutubeUrlFetchStrategy } from '../fetcher/Fetcher';


interface TrackInfo{
    path: string,
    duration: number
}

class Track
{
  public trackInfo: Promise<TrackInfo>;

  /**
   * Constructs a new track
   * @param url The song's url
   */
  public constructor(
    public url: string
  )
  {
    this.trackInfo = this.download();
  }

  /**
   * Downloads the track
   * @returns TrackInfo object including a filepath and song duration
   */
  private async download(): Promise<TrackInfo>
  {
    const fetcher = new Fetcher(new YoutubeUrlFetchStrategy());
    return fetcher.fetch(this.url);
  }

  /**
   * Deletes the audio file for this track
   */
  public async delete()
  {
    unlink((await this.trackInfo).path, e => {
      if(e) console.error(e);
    });
  }
};

export { Track, TrackInfo };