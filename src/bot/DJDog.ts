import { refreshSlashCommands, createInteractions } from './CommandManager';
import { Session } from './Session';

import {
  Client,
  Intents,
  StageChannel,
  TextChannel,
  VoiceChannel
} from 'discord.js';


export class DJDog
{
  public constructor(token: string, client_id: string)
  {
    this.token = token;
    this.client_id = client_id;
    this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

    this.refreshSlashCommands();
    this.createInteractions();

    this.sessions = [];

    this.client.login(this.token);
    this.client.on('ready', () => {
      console.log('Ready!!');
    });
  }

  public getSession(vChannel: VoiceChannel | StageChannel, tChannel: TextChannel): Session
  {
    for(let session of this.sessions)
    {
      if(session.vChannel == vChannel)
      {
        return session;
      }
    }
    return this.sessions[this.sessions.push(new Session(this, vChannel, tChannel)) - 1];
  }

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

    protected token: string;
    protected client_id: string;
    public client: Client;

    private refreshSlashCommands = refreshSlashCommands;
    private createInteractions = createInteractions;

    private sessions: Session[];
};