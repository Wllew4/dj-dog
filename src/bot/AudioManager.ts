import { Track } from './Track';
import { Session } from './Session';
import { Queue, waitForMs } from "../util/util";

import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType } from '@discordjs/voice';
import youtubedl, { raw as youtubedlraw } from 'youtube-dl-exec';
import { Converter } from 'ffmpeg-stream';

export class AudioManager
{
  private timeoutTime: number = 60;
  private timeout: NodeJS.Timeout;

  public audioPlayer: AudioPlayer;
  public queue: Queue<Track>;
  
  private paused: boolean;

  /**
   * Constructs a new AudioManager object
   * Handles audio playback for a session
   */
  public constructor(private session: Session)
  {
    this.paused = false;
    this.queue = new Queue<Track>();
    this.timeout = setTimeout(()=>{},0);
    this.startTimeout();

    this.audioPlayer = createAudioPlayer({	behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    }});

    this.audioPlayer.on('stateChange', (oldState, newState) => {
      if(newState.status == AudioPlayerStatus.Idle && oldState.status != AudioPlayerStatus.Idle)
      {
        //Track concluded
        this.startTimeout();
        this.queue.advance();
        this.checkQueue();
      }
    });
  }

  private startTimeout()
  {
    this.timeout = setTimeout(() => {
      this.session.dj.endSession(this.session);
    }, this.timeoutTime * 1000);
  }

  /**
   * Checks if there's a new song to start streaming
   */
  public async checkQueue()
  {
    if(this.audioPlayer.state.status != AudioPlayerStatus.Idle)
    {
      clearTimeout(this.timeout);
      //currently playing music
      return;
    }
    if(this.queue.length() == 0)
    //queue is empty
      return;
    
    this.stream();
  }

  /**
   * Gets the track from the top of the queue and streams it
   */
  public async stream() {
    clearTimeout(this.timeout);
    const url = this.queue.get().url;
    try{
      // set up ffmpeg
      const converter = new Converter();
      const output = converter.createOutputStream({f:'opus', acodec: 'libopus', b: 128000, application:'audio' });

      // download video & convert
      const subProcess = youtubedlraw(url, {f:'bestaudio', o:'-'});
      subProcess.stdout?.pipe(converter.createInputStream({}));
      converter.run();

      // Discord stuff
      const resource = createAudioResource(output, { inputType: StreamType.OggOpus });
      this.audioPlayer.play(resource);
      this.audioPlayer.on('error', console.error );

      // resolve promise when song is done
      const { duration } = await youtubedl(url, { dumpSingleJson:true });
      await waitForMs(duration * 1000);
      converter.kill();
    }
    catch(err){
      console.error(err);
    }
  }

  /**
   * Pauses playback
   * @returns true if now paused, false if now unpaused
   */
  public pause(): boolean
  {
    if(this.paused)
    {
      this.paused = false;
      this.audioPlayer.unpause();
    }
    else
    {
      this.paused = true;
      this.audioPlayer.pause();
    }
    return this.paused;
  }

  /**
   * Functions below were for the download strategy, now deprecated.
   */

  // private async probeAndCreateResource(path: string): Promise<AudioResource> {
  //   const readableStream = createReadStream(path);
  //   const { stream, type } = await demuxProbe(readableStream);
  //   return createAudioResource(stream, { inputType: type });
  // }

  // public async play(trackInfo: TrackInfo)
  // {
  //   const resource = await this.probeAndCreateResource(trackInfo.path);
  //   this.audioPlayer.play(resource);

  //   await waitForMs(trackInfo.duration * 1000);
  // }
};