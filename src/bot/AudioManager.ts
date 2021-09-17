import { waitForMs } from "../util/util";
import { createReadStream } from 'fs';
import { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, demuxProbe, NoSubscriberBehavior, StreamType } from "@discordjs/voice";
import { TrackInfo } from "./Track";
import youtubedl, { raw as youtubedlraw } from 'youtube-dl-exec';
import { Converter } from "ffmpeg-stream";

export class AudioManager
{
  private paused: boolean;
  public audioPlayer: AudioPlayer;

  /**
   * Constructs a new AudioManager object
   * Handles audio playback for a session
   */
  public constructor()
  {
    this.paused = false;
    this.audioPlayer = createAudioPlayer({	behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    }});
  }

  private async probeAndCreateResource(path: string): Promise<AudioResource> {
    const readableStream = createReadStream(path);
    const { stream, type } = await demuxProbe(readableStream);
    return createAudioResource(stream, { inputType: type });
  }

  public async play(trackInfo: TrackInfo)
  {
    const resource = await this.probeAndCreateResource(trackInfo.path);
    this.audioPlayer.play(resource);

    await waitForMs(trackInfo.duration * 1000);
  }

  public async stream(url: string) {
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

  public pause(): boolean
  {
    //pauses playback

    if(this.paused)
    {
      //unpause
      this.paused = false;
    }
    else
    {
      //pause
      this.paused = true;
    }
    return this.paused;
  }
};