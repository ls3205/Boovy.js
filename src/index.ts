import DiscordJS, { Message, VoiceChannel } from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    DiscordGatewayAdapterCreator,
} from '@discordjs/voice'; // Honestly not sure why I need this import it doesn't do shit but for whatever reason it doesn't work without it.
import * as yts from 'youtube-search-without-api-key' //^
import * as DisTube from 'distube';
import * as commands from './commands/commands'; //Since I didn't import them individually, you need to do commands.search, commands.play, etc. instead of just commands.

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });
const dst = new DisTube.default(client);

import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

client.once('ready', () => {
    console.log(`Ready!, Logged in as ${client.user?.tag}`);
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${prefix}`)) return

    const content = String(message);
    const args = content.substr(content.indexOf(' ') + 1); //Gets everything after the first space
    console.log("Arguments recieved: " + args);

    if (message.content.startsWith(`${prefix}play`)) {
        commands.play(message, args);
    }
    if (message.content.startsWith(`${prefix}join`)) {
        commands.join(message);
    }
    if (message.content.startsWith(`${prefix}stop`)) {
        commands.stop(message);
    }
    if (message.content.startsWith(`${prefix}skip`)) {
        commands.skip(message);
    }
    if (message.content.startsWith(`${prefix}search`)) {
        commands.searchMsg(message, args);
    }
});

dst
    .on('playSong', (message, song) => {
        console.log(`Start playing: ${song}`);
    })

client.login(token);