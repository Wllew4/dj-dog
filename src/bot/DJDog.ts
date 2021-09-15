import { CommandManager } from './CommandManager';
import { Session } from './Session';

import { Client, Intents, StageChannel, VoiceChannel } from 'discord.js';

export class DJDog
{
    public constructor(_token: string, _client_id: string)
    {
        this.token = _token;
        this.client_id = _client_id;

        this.client = new Client({ intents: [Intents.FLAGS.GUILDS] });
        this.cm = new CommandManager(this);
        this.sessions = [];

        this.client.login(this.token);

        this.client.on('ready', () => {
            console.log("Ready!!");
        })
    }

    public AddSession(channel: VoiceChannel | StageChannel)
    {
        for(let session of this.sessions)
        {
            if(session.channel == channel)
            {
                //duplicate session
                return;
            }
        }

        this.sessions[this.sessions.length] = new Session(channel);
    }

    public EndSession(channel: VoiceChannel | StageChannel)
    {
        this.sessions.forEach( (item, index) => {
            if(item.channel == channel)
            {
                item.leave();
                this.sessions.splice(index, 1);
            }
        });
    }

    public token:       string;
    public client_id:   string;

    public client:      Client;
    private cm:         CommandManager;
    public sessions:    Session[];
};