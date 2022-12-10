import Log from './Log'

// cached secrets
let secrets: Secrets

export interface Secrets {
	token: string
	client_id: string
	youtube_api_key: string
}

// fetch secrets
export default async function getSecrets() {
	function unwrap<T>(v: T | undefined): T {
		if (v === undefined) throw Error('Failed to unwrap ' + v)
		else return v
	}
	if (secrets == null) {
		try {
			secrets = {
				token: unwrap(process.env.DISCORD_TOKEN),
				client_id: unwrap(process.env.DISCORD_CLIENT_ID),
				youtube_api_key: unwrap(process.env.YT_API_KEY),
			}
		} catch (error) {
			Log.logSystemErr('Failed to load credentials!')
			Log.logSystemErr(error)
		}
	}
	return secrets
}
