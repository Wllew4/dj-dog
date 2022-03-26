import DJDog from './DJDog';

import { GuildMember, Interaction, TextChannel } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

/**
 * Refreshes the / commands on a given DJDog instance
 * @param this The owning DJDog object
 */
export async function refreshSlashCommands(this: DJDog)
{
	const rest = new REST({ version: '9' }).setToken(this.secrets.token);

	try
	{
		const commands = require('../../commands.json');

		// DEBUG
		await rest.put(
			Routes.applicationGuildCommands(
			this.secrets.client_id,
			"512426401521991681"
			),
        { body: commands });

		await rest.put(
			Routes.applicationCommands(
				this.secrets.client_id,
			),
			{ body: commands });
	}
	catch (e)
	{
		console.error(e);
	}
}

/**
 * Constructs reponses to / commands
 * @param this The owning DJDog object
 */
export async function createInteractions(this: DJDog)
{
	this.client.on('interactionCreate', async (i: Interaction) =>
	{
		//type-checking
		if(!i.isCommand()) return;
		if(!(i.channel instanceof TextChannel)) return;
		if(!(i.member instanceof GuildMember)) return;

		//Commands that don't require a session
		switch(i.commandName)
		{
		case 'ping':
			await i.reply('pong!');
			return;

		case 'pong':
			await i.reply('ping!');
			return;
		}

		//get session
		if(!(i.member.voice.channel))
		{
			i.reply('You are not in a voice channel!');
			return;
		}
		const session = this.getSession(i.member.voice.channel);

		//Commands that DO require a session
		switch(i.commandName)
		{
		case 'join':
			session.join();
			i.reply(`Joining voice channel: ${i.member.voice.channel.name}`);
			if (!session.replyVM) session.linkVM(i.fetchReply());
			else setTimeout(()=>{i.deleteReply()}, 5000);
			return;

		case 'leave':
			this.endSession(session);
			i.reply(`Leaving voice channel: ${i.member.voice.channel.name}`);
			return;

		case 'play':
			let query = i.options.getString('song', true)
			if(await session.play(query))
				i.reply(`Added ${query} to the queue.`);
			else
				i.reply(`Could not find a video for query ${query}`);
			if (!session.replyVM) session.linkVM(i.fetchReply());
			else setTimeout(()=>{i.deleteReply()}, 5000);
			return;
		
		case 'remove':
			const index = i.options.getInteger('index', true);
			const removed = session.remove(index - 1);
			i.reply(`Removed ${(await removed.info).title} from the queue!`);
			setTimeout(()=>{i.deleteReply()}, 5000);
			return;

		case 'skip':
			const skipped = await session.skip();
			if(skipped)
				i.reply('Skipped!');
			else
				i.reply('The queue is empty!');
			setTimeout(()=>{i.deleteReply()}, 5000);
			return;

		case 'pause':
			const isPaused: boolean = await session.pause();
			i.reply(
				(isPaused ? 'Paused': 'Unpaused')
					+ ' playback.'
			);
			setTimeout(()=>{i.deleteReply()}, 5000);
			return;
		}
	});
}