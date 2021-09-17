import youtubedl, { YtResponse } from 'youtube-dl-exec';
import { TrackInfo } from '../bot/Track';
import { IFetchStrategy } from './IFetchStrategy';

export class YoutubeUrlFetchStrategy implements IFetchStrategy {
  constructor(){
  }

  private async download(url:string): Promise<void> {
    // download by youtube url & converts to mp3
    await youtubedl(url, { f:'bestaudio[ext=m4a]', x:true, audioFormat:'mp3'});
  }

  private async getTrackInfo(url:string): Promise<TrackInfo> {
    // without downloading, this simulates the filename output
    const res = await youtubedl(url, { f:'bestaudio[ext=m4a]', dumpSingleJson:true });
    // filename output simulation uses the wrong extension smh
    const path = `${res.title}-${res.id}.mp3`;
    return {
      path: path,
      duration: res.duration
    };
  }

  async fetch(url: string): Promise<TrackInfo> {
    // return filename once download is ready
    // const [trackInfo] = await Promise.all([this.getTrackInfo(url),this.download(url)]);
    return {
      duration:0,
      path:''
    };
  }
}