import { Track } from './Track';
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
  public audioPlayer: AudioPlayer;
  public queue:       Queue<Track>;
  private paused:     boolean;

  /**
   * Constructs a new AudioManager object
   * Handles audio playback for a session
   */
  public constructor()
  {
    this.paused = false;
    this.queue = new Queue<Track>();

    this.audioPlayer = createAudioPlayer({	behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    }});

    this.audioPlayer.on('stateChange', (oldState, newState) => {
      if(newState.status == AudioPlayerStatus.Idle && oldState.status != AudioPlayerStatus.Idle)
      {
        //Track concluded
        this.queue.advance();
        this.checkQueue();
      }
    });
  }

  /**
   * Checks if there's a new song to start streaming
   */
  public async checkQueue()
  {
    if(this.audioPlayer.state.status != AudioPlayerStatus.Idle || this.queue.length() == 0)
      //currently playing music or queue is empty
      return;
    
    this.stream();
  }

  /**
   * Gets the track from the top of the queue and streams it
   */
  public async stream() {
    const url = this.queue.get().url;
    try{
      // set up ffmpeg
      const converter = new Converter();
      const input = converter.createInputStream({});
      const output = converter.createOutputStream({f: "opus", b: '192000'});

      // download video & convert
      youtubedlraw(url, {f:'bestaudio', o:'-'}).stdout?.pipe(input);
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