import { refreshSlashCommands } from './CommandManager';
import Session from './Session';
import { Secrets } from '../Secrets';

import {
	Client,
	CommandInteraction,
	GuildMember,
	Intents,
	Interaction,
	StageChannel,
	TextChannel,
	VoiceChannel
} from 'discord.js';

function replyTimeout(i: CommandInteraction, msg: string)
{
	i.reply(msg);
	setTimeout(()=>{i.deleteReply()}, 5000);
}

export default class DJDog
{
	protected client: Client;
	private sessions: Session[]		= [];

	//Command initialization methods
	private refreshSlashCommands	= refreshSlashCommands;

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
		this.client.on('interactionCreate', (i) => { this.replyCommands(i) });

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
	public getSession(vChannel: VoiceChannel | StageChannel): Session | undefined
	{
		for(let session of this.sessions)
		{
			if(session.vChannel == vChannel)
			{
				return session;
			}
		}
	}

	public startSession(vChannel: VoiceChannel | StageChannel): Session
	{
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

	private async replyCommands(i: Interaction)
	{
		// Type-checking
		if(	! i.isCommand()
		||	!(i.channel instanceof TextChannel)
		||	!(i.member  instanceof GuildMember))
			return;

		// Commands that don't require a session
		switch(i.commandName)
		{
			case 'ping':
				await i.reply('pong!');
				return;

			case 'pong':
				await i.reply('ping!');
				return;
		}

		// Check for existing session
		const vc = i.member.voice.channel;
		if(!vc)
		{
			replyTimeout(i, 'You are not in a voice channel!');
			return;
		}
		let session = this.getSession(vc);

		// Commands that DO require a session
		switch(i.commandName)
		{
			case 'join':
				if(session === undefined)
				{
					this.startSession(vc).join(i);
					i.reply(`Joining voice channel: ${vc}`);
					break;
				}
				replyTimeout(i, `A session already exists in ${vc}`)
				break;

			case 'leave':
				if(session === undefined)
				{
					replyTimeout(i, `No active session exists in ${vc}`);
					break;
				}
				this.endSession(session);
				replyTimeout(i, `Leaving voice channel: ${vc}`);
				break;

			case 'play':
				let newSession = false;
				if(session === undefined)
				{
					session = this.startSession(vc);
					session.join(i);
					newSession = true;
				}
				const query = i.options.getString('song', true);
				i.reply(await session.play(query));
				if(!newSession)
					setTimeout(()=>{i.deleteReply()}, 5000);
				break;

			// case 'remove':
			// 	const index = i.options.getInteger('index', true);
			// 	const removed = session.remove(index - 1);
			// 	i.reply(`Removed ${(await removed.info).title} from the queue!`);
			// 	setTimeout(()=>{i.deleteReply()}, 5000);
			// 	break;

			// case 'skip':
			// 	const skipped = await session.skip();
			// 	if(skipped)
			// 		i.reply('Skipped!');
			// 	else
			// 		i.reply('The queue is empty!');
			// 	setTimeout(()=>{i.deleteReply()}, 5000);
			// 	break;

			// case 'pause':
			// 	const isPaused: boolean = await session.pause();
			// 	i.reply(
			// 		(isPaused ? 'Paused': 'Unpaused')
			// 			+ ' playback.'
			// 	);
			// 	setTimeout(()=>{i.deleteReply()}, 5000);
			// 	break;
		}
	}
};
