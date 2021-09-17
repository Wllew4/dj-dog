import { AudioManager } from './AudioManager';
import { Track } from './Track';

import { StageChannel, VoiceChannel } from 'discord.js';
import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  VoiceConnection
} from '@discordjs/voice';


export class Session
{
  private audioManager: AudioManager;

  private connection: VoiceConnection;

  private controller: AbortController;
  private signal: AbortSignal;

  /**
   * Starts a new session.
   * @param vChannel The voice channel associated with the session
   */
  constructor(public vChannel: VoiceChannel | StageChannel)
  {
    this.connection = joinVoiceChannel({
      channelId: this.vChannel.id,
      guildId: this.vChannel.guild.id,
      adapterCreator: this.vChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    this.audioManager = new AudioManager();
    this.connection.subscribe(this.audioManager.audioPlayer);

    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }

  /**
   * Connects the bot to its voice channel
   */
  public async join()
  {
    try
    {
      await entersState(this.connection, VoiceConnectionStatus.Ready, this.signal);
    }
    catch (e)
    {
      this.controller.abort();
      console.error(e);
    }
  }

  /**
   * Disconnects the bot from its voice channel
   */
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

  /**
   * Adds a song to the queue
   * @param url The url of the song to queue up
   */
  public async play(url: string)
  {
    this.audioManager.queue.add(new Track(url));
    this.audioManager.checkQueue();
  }

  /**
   * Gets a list of the queued up tracks
   * @returns A string listing the queued up tracks
   */
  public async showQueue(): Promise<string>
  {
    const queue = this.audioManager.queue;
    let o: string = `\`\`\`${queue.length()} items in queue:\n`;
    for(let i = 0; i < queue.length(); i++)
    {
      o += `${i+1}. ${queue.at(i).url}\n`;
    }
    o += `\`\`\``;
    return o;
  }

  /**
   * Skips the current song
   * @returns true if there is another track, false if the queue is empty
   */
  public async skip(): Promise<boolean>
  {
    this.audioManager.audioPlayer.stop();
    if(this.audioManager.queue.length() == 0)
      return false;
    else
      return true;
  }

  /**
   * Pauses/unpauses playback
   * @returns true if paused, false if unpaused
   */
  public async pause(): Promise<boolean>
  {
    return this.audioManager.pause();
  }
};