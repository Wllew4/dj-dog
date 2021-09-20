import { DJDog } from './DJDog';
import fs from 'fs/promises';

import { GuildMember, Interaction, TextChannel } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

/**
 * Refreshes the / commands on a given DJDog instance
 * @param this The owning DJDog object
 */
export async function refreshSlashCommands(this: DJDog)
{
  const rest = new REST({ version: '9' }).setToken(this.token);

  try
  {
    const commands = require('../../commands.json');
    await rest.put(
      //DEBUG
      //Change to applicationCommands for release
      Routes.applicationGuildCommands(
        this.client_id,
        '887541961161080883'
      ),
      { body: commands });
  }
  catch (e)
  {
    console.error(e);
  }
}

/**
 * Constructs reponses to / commands
 * @param this The owning DJDog object
 */
export async function createInteractions(this: DJDog)
{
  this.client.on('interactionCreate', async (i: Interaction) =>
  {
    //type-checking
    if(!i.isCommand()) return;
    if(!(i.channel instanceof TextChannel)) return;
    if(!(i.member instanceof GuildMember)) return;

    //Commands that don't require a session
    switch(i.commandName)
    {
    case 'ping':
      await i.reply('pong!');
      return;

    case 'pong':
      await i.reply('ping!');
      return;
    }

    //get session
    if(!(i.member.voice.channel))
    {
      i.reply('You are not in a voice channel!');
      return;
    }
    const session = this.getSession(i.member.voice.channel);

    //Commands that DO require a session
    switch(i.commandName)
    {
    case 'join':
      session.join();
      i.reply(`Joining voice channel: ${i.member.voice.channel.name}`);
      return;

    case 'leave':
      this.endSession(session);
      i.reply(`Leaving voice channel: ${i.member.voice.channel.name}`);
      return;

    case 'play':
      session.play(i.options.getString('song', true));
      i.reply(`Added ${i.options.getString("song", true)} to the queue.`);
      return;

    case 'queue':
      i.reply( await session.showQueue());
      return;

    case 'skip':
      const skipped = await session.skip();
      if(skipped)
        i.reply('Skipped!');
      else
        i.reply('The queue is empty!');
      return;

    case 'pause':
      const isPaused: boolean = await session.pause();
      i.reply(
        (isPaused ? 'Paused': 'Unpaused')
          + ' playback.'
      );
      return;
    }
  });
}