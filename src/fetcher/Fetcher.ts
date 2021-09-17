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

  // todo: move this

  // private async probeAndCreateResource(filename: string) {
  //   const readableStream = createReadStream(filename);
  //   const { stream, type } = await demuxProbe(readableStream);
  //   return createAudioResource(stream, { inputType: type });
  // }
  
  // async tryPlayingAudio(url:string) {
  //     const player = createAudioPlayer({	behaviors: {
  //       noSubscriber: NoSubscriberBehavior.Pause,
  //     }});
  //     vc.subscribe(player);
  //     const filename = await fetchStrategy.fetch(url);
  //     const resource = await probeAndCreateResource(filename);
  //     player.play(resource);
  // }}
}

export { Fetcher, YoutubeUrlFetchStrategy };