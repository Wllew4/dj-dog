import { refreshSlashCommands, createInteractions } from './CommandManager';
import { Session } from './Session'

import {
    Client,
    CommandInteraction,
    GuildMember,
    Intents,
    TextChannel
} from 'discord.js';


export class DJDog
{
    public constructor(_token: string, _client_id: string)
    {
        this.token      = _token;
        this.client_id  = _client_id;
        this.client     = new Client({ intents: [Intents.FLAGS.GUILDS] });

        this.refreshSlashCommands();
        this.createInteractions();

        this.sessions = [];

        this.client.login(this.token);
        this.client.on('ready', () => {
            console.log('Ready!!');
        })
    }

    public getSession(i: CommandInteraction): Session | undefined
    {
        if(i.member instanceof GuildMember
            && i.member.voice.channel
            && i.channel instanceof TextChannel)
        {
            const channel = i.member.voice.channel;

            for(let session of this.sessions)
            {
                if(session.vChannel == channel)
                {
                    return session;
                }
            }
            return this.sessions[this.sessions.push(new Session(channel, i.channel)) - 1];
        }
        i.reply('You need to be in a voice channel!');
    }

    public endSession(i: CommandInteraction)
    {
        if(i.member instanceof GuildMember && i.member.voice.channel)
        {
            const channel = i.member.voice.channel;

            this.sessions.forEach( (item, index) => {
                if(item.vChannel == channel)
                {
                    item.leave();
                    this.sessions.splice(index, 1);
                }
            });
        }
    }

    protected token:        string;
    protected client_id:    string;
    public client:          Client;

    private refreshSlashCommands    = refreshSlashCommands;
    private createInteractions      = createInteractions;

    private sessions: Session[];
};