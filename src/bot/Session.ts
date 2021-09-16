import { Track } from './Track';
import { Queue } from '../util/Queue';

import { StageChannel, TextChannel, VoiceChannel } from 'discord.js';
import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  VoiceConnection
} from '@discordjs/voice';
import { waitForMs } from '../util/util';
import { DJDog } from './DJDog';
import { AudioManager } from './AudioManager';


export class Session
{
  constructor(dj: DJDog, vChannel: VoiceChannel | StageChannel, tChannel: TextChannel)
  {
    //30s of inactivity -> disconnect
    this.timeout = 10 * 1000;
    this.checkingTimeout = false;

    this.DJ = dj;
    this.vChannel = vChannel;
    this.tChannel = tChannel;

    this.queue = new Queue<Track>();
    this.audioManager = new AudioManager(this.vChannel);

    //TEST
    // this.queue.add(new Track(':) 1'));
    // this.queue.add(new Track(':) 2'));
    // this.queue.add(new Track(':) 3'));
    // this.queue.add(new Track(':) 4'));


    this.connection = joinVoiceChannel({
      channelId: this.vChannel.id,
      guildId: this.vChannel.guild.id,
      adapterCreator: this.vChannel.guild.voiceAdapterCreator
    });

    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }

  public async join()
  {
    try
    {
      await entersState(this.connection, VoiceConnectionStatus.Ready, this.signal);
      this.inactivityCheck();
    }
    catch (e)
    {
      this.controller.abort();
      console.error(e);
    }
  }

  public async leave()
  {
    try
    {
      this.connection.destroy();
    }
    catch (e)
    {
      console.error(e);
    }
  }

  public async play(url: string)
  {
    this.queue.add(new Track(url));
    if(this.queue.length() == 1)
    {
      while(this.queue.length() > 0)
      {
        const nextTrack = this.queue.get();
        if(nextTrack)
        {
          await this.audioManager.play(nextTrack.path);
        }
        else
          console.error('ERROR: Queue length is 1 but couldn\'t get song??');

        this.queue.advance();
        this.inactivityCheck();
      }
    }
  }

  public async showQueue(): Promise<string>
  {
    let o: string = `\`\`\`${this.queue.length()} items in queue:\n`;
    for(let i = 0; i < this.queue.length(); i++)
    {
      o += `${i+1}. ${this.queue.at(i).url}\n`;
    }
    o += `\`\`\``;
    return o;
  }

  public async skip(): Promise<boolean>
  {
    const nextTrack = this.queue.get();
    this.queue.advance();
    this.inactivityCheck();
    if(nextTrack)
    {
      this.audioManager.play(nextTrack.path);
      return true;
    }
    else
    {
      return false;
    }
  }

  public async pause(): Promise<boolean>
  {
    return this.audioManager.pause();
  }

  private async inactivityCheck()
  {
    if(this.checkingTimeout) return;
    this.checkingTimeout = true;

    await waitForMs(this.timeout);
    if(this.queue.length() == 0)
    {
      this.tChannel.send("Left due to inactivity");
      this.DJ.endSession(this);
    }

    this.checkingTimeout = false;
  }

    private timeout: number;
    private checkingTimeout:boolean;

    private queue: Queue<Track>;
    private audioManager: AudioManager;

    private DJ: DJDog;
    public vChannel: VoiceChannel | StageChannel;
    private tChannel: TextChannel;
    private connection: VoiceConnection;

    private controller: AbortController;
    private signal: AbortSignal;
};