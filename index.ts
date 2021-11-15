import DiscordJS, { Message, VoiceChannel } from 'discord.js';
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

function search(query) {
    var link;
    const makeRequest = new Promise<any>((resolve, reject) => {
        setTimeout(function (): void {

            // convert 'string' to 'number'
            const vidjson = yts.search(query);

            if (vidjson != undefined) {
                resolve(vidjson);
            } else {
                reject(new Error('Unable to fetch data'));
            }

        }, 1000);
    });

    // listen to promise resolution
    makeRequest.then((value) => {
        //console.log(value[0].url);
        link = String(value[0].url);
    }).catch((error) => {
        console.log(`Error: ${error}`);
        return 'Error';
    }).finally(() => {
        // always executed
        console.log('Completed')
    });
    return link;
}

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });

import dotenv from 'dotenv';
import { channel } from 'diagnostics_channel';
import { link } from 'fs';
dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

const player = createAudioPlayer();

function play(message, query) {
    let link = String(search(query));
    const resource = createAudioResource(link);
    console.log(link);
    message.reply(`Now playing, ${link}!`);
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

    const content = String(message);
    const args = content.substr(content.indexOf(' ')+1);

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, args);
    }
    if (message.content.startsWith(`${prefix}search`)) {
        console.log(search(args));
    }
    // if (message.content.startsWith(`${prefix}join`)) {
    //     const channel = message.member?.voice.channel;

    //     if (channel) {
    //         try {
    //             const connection = await join(channel);
    //             console.log(connection);
    //             connection.subscribe(player);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     } else {
    //         void message.reply('Join a voice channel then try again!');
    //     }
    // }
});

client.login(token);
