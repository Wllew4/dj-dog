import { DJDog } from './DJDog';
import commands from './commands.json';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, GuildMember } from 'discord.js';

export class CommandManager
{
    public constructor(instance: DJDog)
    {
        this.dogInstance= instance;
        this.client     = instance.client;
        this.token      = instance.token;
        this.client_id  = instance.client_id;

        this.refreshSlashCommands();
        this.createInteractions();
    }

    private async refreshSlashCommands()
    {
        const rest = new REST({ version: '9' }).setToken(this.token);
    
        try
        {
            await rest.put(
                //DEBUG
                //Change to applicationCommands for release
                Routes.applicationGuildCommands(
                    this.client_id,
                    "887541961161080883"
                ),
                { body: commands });

            console.log("Successfully registered commands");
        }
        catch (e)
        {
            console.error(e);
        }
    }

    private createInteractions()
    {
        this.client.on('interactionCreate', async i =>
        {
            if(!i.isCommand()) return;

            switch(i.commandName)
            {
                case 'ping':
                    await i.reply('pong!');
                    break;
                case 'pong':
                    await i.reply('ping!');
                    break;
                case 'join':
                    if(i.member instanceof GuildMember && i.member.voice.channel)
                    {
                        this.dogInstance.AddSession(i.member.voice.channel);
                        i.reply("Joining voice channel: " + i.member.voice.channel.name);
                    }
                    else
                        i.reply("Could not find your voice channel :/");
                    break;
                case 'leave':
                    if(i.member instanceof GuildMember && i.member.voice.channel)
                    {
                        this.dogInstance.EndSession(i.member.voice.channel);
                        i.reply("Leaving voice channel: " + i.member.voice.channel.name);
                    }
                    else
                        i.reply("Could not find your voice channel :/");
                    break;
            }
        });
    }

    private dogInstance:DJDog;
    private client:     Client;
    private token:      string;
    private client_id:  string;
};