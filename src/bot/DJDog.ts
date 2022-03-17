import { refreshSlashCommands, createInteractions } from './CommandManager';
import Session from './Session';
import { Secrets } from '../Secrets';

import {
	Client,
	Intents,
	StageChannel,
	VoiceChannel
} from 'discord.js';

export default class DJDog
{
	protected client: Client;
	private sessions: Session[]		= [];

	//Command initialization methods
	private refreshSlashCommands	= refreshSlashCommands;
	private createInteractions		= createInteractions;

	/**
	 * Bot class, initializes commands and manages sessions.
	 * @param secrets the contents of confidential.json
	 */
	public constructor(protected secrets: Secrets)
	{
		this.client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_VOICE_STATES
			]
		});

		this.refreshSlashCommands();
		this.createInteractions();

		this.client.login(this.secrets.token);
		this.client.on('ready', () => {
			console.log('Ready!!');
		});
	}

	/**
	 * Finds a session by the voice channel associated with it
	 * @param vChannel Voice channel associated with the session
	 * @returns A session based on the parameters given
	 */
	public getSession(vChannel: VoiceChannel | StageChannel): Session
	{
		for(let session of this.sessions)
		{
			if(session.vChannel == vChannel)
			{
				return session;
			}
		}
		return this.sessions[this.sessions.push(new Session(vChannel, this)) - 1];
	}

	/**
	 * Ends a session
	 * @param s the session to end
	 */
	public endSession(s: Session)
	{
		this.sessions.forEach( (item, index) => {
			if(item == s)
			{
				item.leave();
				this.sessions.splice(index, 1);
			}
		});
	}
};