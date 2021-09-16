import { DJDog } from './DJDog';
import commands from './commands.json';

import { GuildMember, Interaction } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export async function refreshSlashCommands(this: DJDog)
{
    const rest = new REST({ version: '9' }).setToken(this.token);

    try
    {
        await rest.put(
            //DEBUG
            //Change to applicationCommands for release
            Routes.applicationGuildCommands(
                this.client_id,
                '887541961161080883'
            ),
            { body: commands });

        console.log('Successfully registered commands');
    }
    catch (e)
    {
        console.error(e);
    }
}

export async function  createInteractions(this: DJDog)
{
    this.client.on('interactionCreate', async (i: Interaction) =>
    {
        //type-checking
        if(!i.isCommand()) return;
        const session = this.getSession(i);
        if(!session) return;
        if(!(i.member instanceof GuildMember && i.member.voice.channel)) return;

        //command switch
        switch(i.commandName)
        {
            case 'ping':
                await i.reply('pong!');
                break;

            case 'pong':
                await i.reply('ping!');
                break;

            case 'join':
                session.join();
                i.reply(`Joining voice channel: ${i.member.voice.channel.name}`);
                break;

            case 'leave':
                this.endSession(i);
                i.reply(`Leaving voice channel: ${i.member.voice.channel.name}`);
                break;
                
            case 'play':
                session.play(i.options.getString('song', true));
                i.reply(`Added ${i.options.getString("song", true)} to the queue.`)
                break;
        }
    });
}