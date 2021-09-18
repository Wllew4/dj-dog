// activate api & get key from https://console.cloud.google.com/apis/library/youtube.googleapis.com
import { youtube_api_key } from '../confidential.json';
import fetch from 'cross-fetch';

class Search{
  static async search (query: string): Promise<string> {
    const res = await fetch(`//www.googleapis.com/youtube/v3/search?key=${youtube_api_key}&q=${query}&maxResults=1&type=video&videoCategoryId=10`, { method: 'GET' });

    if (!res.ok) {
      console.error(res);
      throw new Error("Bad response from server");
    }

    const resJson = await res.json();
    console.log(resJson);

    // @ts-ignore
    const searchResult = resJson.items[0];
    if (!searchResult) {
      throw Error(`No video found for query: ${query}`);
    }
    return `https://www.youtube.com/watch?v=${searchResult.id.videoId}`;
  }

  static isValidUrl (url: string): boolean {
    return (
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('www.youtube.com/') ||
      url.startsWith('youtube.be/')
    );
  }
}

export default Search;