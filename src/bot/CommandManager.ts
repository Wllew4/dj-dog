import { DJDog } from './DJDog';
import commands from './commands.json';

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, CommandInteraction } from 'discord.js';

export class CommandManager
{
    public constructor(instance: DJDog)
    {
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
                Routes.applicationCommands(
                    this.client_id
                ),
                { body: commands });
        }
        catch (e)
        {
            console.error(e);
        }
    }

    private bindCommand(command: string, response: (i: CommandInteraction) => void)
    {
        this.client.on('interactionCreate', async i => 
        {
            if(!i.isCommand()) return;
            if(i.commandName === command)
                response(i);
        });
    }

    private createInteractions()
    {
        this.bindCommand("ping", async (i: CommandInteraction) => {
            await i.reply('pong!');
        });
        this.bindCommand("pong", async (i: CommandInteraction) => {
            await i.reply('ping!');
        });
    }

    private client:     Client;
    private token:      string;
    private client_id:  string;
};