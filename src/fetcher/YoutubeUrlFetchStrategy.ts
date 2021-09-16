import youtubedl, { YtResponse } from 'youtube-dl-exec';

class YoutubeUrlFetchStrategy implements IFetchStrategy {
  constructor(){
  }

  private async download(url:string): Promise<void> {
    // download by youtube url & converts to mp3
    await youtubedl(url, { f:'bestaudio[ext=m4a]', x:true, audioFormat:'mp3'});
  }

  private async getFilename(url:string): Promise<string> {
    // without downloading, this simulates the filename output
    const res = await (youtubedl(url, { f:'bestaudio[ext=m4a]', getFilename:true })).toString();
    // filename output simulation uses the wrong extension smh
    const corrected = res.substring(0, res.length-3) + 'mp3';
    return corrected;
  }

  async fetch(url: string): Promise<string> {
    // return filename once download is ready
    let [filename] = await Promise.all([this.getFilename(url),this.download(url)]);
    return filename;
  }
}