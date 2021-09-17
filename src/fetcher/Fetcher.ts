import { TrackInfo } from "../bot/Track";
import { IFetchStrategy } from "./IFetchStrategy";
import { YoutubeUrlFetchStrategy } from "./YoutubeUrlFetchStrategy";

class Fetcher {
  constructor(
    private fetchStrategy: IFetchStrategy
  ) {}

  /**
   * 
   * @param url URL to fetch audio from
   * @returns The saved filename once the file is downloaded
   */
  public async fetch(url:string): Promise<TrackInfo> {
    return await this.fetchStrategy.fetch(url);
  }
}

export { Fetcher, YoutubeUrlFetchStrategy };