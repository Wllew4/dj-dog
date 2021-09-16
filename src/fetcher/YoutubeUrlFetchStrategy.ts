import youtubedl from 'youtube-dl-exec';

class YoutubeUrlFetchStrategy implements IFetchStrategy {
  constructor(){
  }
  fetch(url: string): MediaStream {
    throw new Error('Method not implemented.');
  }
  // async fetch(url: string): MediaStream {
  //   throw new
  //   const mediaStream = await youtubedl('url');
  //   return mediaStream();
  // }
}