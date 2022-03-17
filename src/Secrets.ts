// cached secrets
let secrets: Secrets;

export interface Secrets
{
	token:"",
	client_id:"",
	youtube_api_key:""
}

// fetch secrets
export default async function getSecrets ()
{
	if(secrets == null)
	{
		try
		{
			secrets = require('../confidential.json');
		}
		catch (error)
		{
			console.log("Failed to load credentials!");
			console.error(error);
		}
	}
	return secrets;
}