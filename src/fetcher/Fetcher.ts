// Require the necessary discord.js classes
import { createReadStream } from 'fs';
import { Client, CommandInteraction, Intents, Snowflake, StageChannel, VoiceChannel } from 'discord.js';
import { token } from '../confidential.json';
import youtubedl from 'youtube-dl-exec';
import { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, demuxProbe, createAudioResource, AudioPlayerStatus, JoinVoiceChannelOptions, CreateVoiceConnectionOptions } from '@discordjs/voice';

class Fetcher {
  constructor(
    private fetchStrategy: IFetchStrategy
  ) {}

  public async fetch(url:string): Promise<string> {
    return await this.fetchStrategy.fetch(url);
  }
}

// Create a new client instance
const client = new Client({ 
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] 
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);

async function findVc(guildId:Snowflake, userId:Snowflake) {

  const channels = await client.guilds.resolve(guildId)?.channels.fetch();
  const vc = channels?.find((ch)=>{return ch.isVoice() && ch.members.has(userId);});
  if (vc instanceof VoiceChannel || vc instanceof StageChannel) return vc;
  else throw Error("Can't find voice channel");
}

async function probeAndCreateResource(filename: string) {
  const readableStream = createReadStream(filename);
  const { stream, type } = await demuxProbe(readableStream);
  return createAudioResource(stream, { inputType: type });
}

async function tryPlayingAudio(interaction:CommandInteraction, url:string) {
  try{
    const member = interaction.member;
    let ch:VoiceChannel|StageChannel;
    ch = await findVc(interaction.guildId || "", interaction.user.id);

    let vcOpts:JoinVoiceChannelOptions & CreateVoiceConnectionOptions;
    const fetchedChannel = await ch.fetch();
    const fetchedGuild = await ch.guild.fetch();
    if (fetchedChannel instanceof VoiceChannel || fetchedChannel instanceof StageChannel) {
      vcOpts = {
        channelId: fetchedChannel.id,
        guildId: fetchedGuild.id,
        selfDeaf: false,
        selfMute: false,
        adapterCreator: fetchedGuild.voiceAdapterCreator,
      };
    }
    else throw Error("Idk how, but the voice/stage channel is no longer of that type");

    const vc = joinVoiceChannel(vcOpts);

    const player = createAudioPlayer({	behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    }});
    vc.subscribe(player);
    interaction.channel?.sendTyping();
    const filename = await fetch(url);
    interaction.channel?.send(`downloaded ${filename}`);

    player.on(AudioPlayerStatus.Playing, () => {
      interaction.channel?.send("playing");
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      interaction.channel?.send("buffering");
    });

    player.on(AudioPlayerStatus.AutoPaused, () => {
      interaction.channel?.send("done");
    });

    const resource = await probeAndCreateResource(filename);
    player.play(resource);

  }
  catch (e) {
    console.error(e);
  }
}

client.on('interactionCreate', interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'ytformats') {
    let url = interaction.options.getString("url");
    if (url == null) url = "";
    tryPlayingAudio(interaction, url);
  }
  interaction.reply("ok");
});

//import {register as registerCommands} from './commands';
//registerCommands();

const { generateDependencyReport } = require('@discordjs/voice');

console.log(generateDependencyReport());