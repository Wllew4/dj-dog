import { youtube_api_key } from '../confidential.json';
import nodeFetch from "node-fetch";

class Search{
  static async search (query: string): Promise<string> {
    const body = {
      key: youtube_api_key,
      q: query,
      maxResults: 1,
      type: 'video',
      videoCategoryId: 10
    };
    const res = await nodeFetch('https://www.googleapis.com/youtube/v3/search', {
      body: JSON.stringify(body)
    });
    // @ts-ignore
    const searchResult = res.body.items[0];
    if (!searchResult) {
      throw Error(`No video found for query: ${query}`);
    }
    return `https://www.youtube.com/watch&v=${searchResult.id.videoId}`;
  }
}

export default Search;