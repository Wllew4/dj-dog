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
  protected client: Client;
  private sessions: Session[];

  private refreshSlashCommands = refreshSlashCommands;
  private createInteractions = createInteractions;

  public constructor(protected token: string, protected client_id: string)
  {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES
      ]
    });

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
};