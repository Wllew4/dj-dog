import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { clientId, token } from './config.json';

const commands = [
	new SlashCommandBuilder().setName('ytformats').setDescription('Gets formats available for a youtube url')
	.addStringOption((option) =>
		option
			.setName('url')
			.setDescription('youtube url')
			.setRequired(true)
	)

].map(command => command.toJSON());

function register(){
	const rest = new REST({ version: '9' }).setToken(token);

	(async () => {
		try {
			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);

			console.log('Successfully registered application commands.');
		} catch (error) {
			console.error(error);
		}
	})();
}

export {register}