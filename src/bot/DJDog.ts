import { CommandManager } from './CommandManager';

import { Client, Intents } from 'discord.js';

export class DJDog
{
    public constructor(_token: string, _client_id: string)
    {
        this.token = _token;
        this.client_id = _client_id;

        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
        this.cm = new CommandManager(this);

        this.client.login(this.token);
    }

    public token:       string;
    public client_id:   string;

    public client:      Client;
    private cm:         CommandManager;
};