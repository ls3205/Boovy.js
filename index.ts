import DiscordJS, { VoiceChannel } from 'discord.js';
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
import * as yts from 'youtube-search-without-api-key'
import * as yts2 from 'yt-search'

/*
const makeRequest = new Promise<any>((resolve, reject) => {
    setTimeout(function(): void {

        // convert 'string' to 'number'
        const test_url = yts.search('bean');

        if (test_url != undefined) {
            resolve(test_url);
        } else {
            reject(new Error('Unable to fetch url'));
        }

    }, 1000);
});

// listen to promise resolution
makeRequest.then((value) => {
    console.log(value[0].url);
}).catch((error) => {
    console.log(`Error: ${error}`);
}).finally(() => {
    // always executed
    console.log('Completed')
});
*/

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });

import dotenv from 'dotenv';
import { channel } from 'diagnostics_channel';
dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const player = createAudioPlayer();

function play(guild, query) {
    // let link = highest_search(query);
    // const resource = createAudioResource(link);
    // console.log(link);
}

function highest_search(query) {
    let video = yts.search(query);
    return video;
}

async function join(channel: VoiceChannel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        throw error;
    }
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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${prefix}`)) return;

    const args = message.content.split(' ');

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, args);
    }
    if (message.content.startsWith(`${prefix}search`)) {
        console.log(highest_search(args));
    }
    if (message.content.startsWith(`${prefix}join`)) {
        const channel = message.member?.voice.channel;

        if (channel) {
            try {
                const connection = await join(channel);
                console.log(connection);
                connection.subscribe(player);
            } catch (error) {
                console.error(error);
            }
        } else {
            void message.reply('Join a voice channel then try again!');
        }
    }
});

client.login(token);
