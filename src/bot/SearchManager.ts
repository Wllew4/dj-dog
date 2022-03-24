// activate api & get key from https://console.cloud.google.com/apis/library/youtube.googleapis.com
import getSecrets from '../Secrets';
import fetch from 'cross-fetch';

export default class SearchManager
{
	static async search (query: string): Promise<string | null> {

		console.log(`Searching for: \"${query}\"...`);

		const { youtube_api_key } = await getSecrets();
		const res = await fetch(`//www.googleapis.com/youtube/v3/search?key=${youtube_api_key}&q=${query}&maxResults=1&type=video&videoCategoryId=10&safeSearch=none`, { method: 'GET' });

		if (!res.ok) {
			console.log("Bad response from server:");
			console.error(res);
			return null;
		}

		const resJson = await res.json();

		const searchResult = resJson.items[0];
		if (!searchResult) {
			console.log(`No video found for query: ${query}`);
			return null;
		}
		const url = `https://www.youtube.com/watch?v=${searchResult.id.videoId}`;
		console.log(`Found: ${url}`);
		return url;
	}

	static isValidUrl (url: string): boolean {
		try {
			new URL(url);
		} catch (err) {
			return false;
		} 
		return true;
	}
}