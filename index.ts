import DiscordJS from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
const yts = require('yt-search');

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });

import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const player = createAudioPlayer();

function play(guild, query) {
    let link = highest_search(query);
    const resource = createAudioResource(link);
    console.log(link);
}

function highest_search(query) {
    var video = yts("yes", query);
    return video;
}

client.once('ready', () => {
    console.log(`Ready!, Logged in as ${client.user?.tag}`);
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${prefix}`)) return;

    const args = message.content.split(' ');

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, args);
    }
    if (message.content.startsWith(`${prefix}search`)) {
        console.log(highest_search(args));
    }
});

client.login(token);