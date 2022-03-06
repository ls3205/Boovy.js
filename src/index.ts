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
import * as yts from 'yt-search' //^
import * as DisTube from 'distube';
import * as commands from './commands/commands'; //Since I didn't import them individually, you need to do commands.search, commands.play, etc. instead of just commands.
import * as server from './server';

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });
const dst = new DisTube.default(client, {
    leaveOnEmpty: false,
    emptyCooldown: 5000,
    leaveOnStop: false
});

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
    var connection;
    console.log("Arguments recieved: " + args);

    if (message.content.startsWith(`${prefix}play`)) { await commands.play(message, args); }
    if (message.content.startsWith(`${prefix}join`)) { connection = await commands.join(message); }
    if (message.content.startsWith(`${prefix}stop`)) { await commands.stop(message); }
    if (message.content.startsWith(`${prefix}skip`)) { await commands.skip(message); }
    if (message.content.startsWith(`${prefix}search`)) { await commands.searchMsg(message, args); }
    if (message.content.startsWith(`${prefix}leave`)) { await commands.leave(message); }
    if (message.content.startsWith(`${prefix}queue`)) { await commands.queue(message); }
    if (message.content.startsWith(`${prefix}volume`)) { await commands.volume(message, args); }
    if (message.content.startsWith(`${prefix}loop`)) { await commands.loop(message); }
    if (message.content.startsWith(`${prefix}np`)) { await commands.nowPlaying(message); }
});

dst
    .on('playSong', (message, song) => {
        console.log(`Start playing: ${song}`);
    })

server.keepAlive();
client.login(token);
