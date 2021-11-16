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
} from '@discordjs/voice';
import * as yts from 'youtube-search-without-api-key'
import * as DisTube from 'distube';

const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });
const dst = new DisTube.default(client);
const queue = new Map()

import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

async function search(query) {
    let json = await yts.search(query);
    let url = await json[0].url;
    await console.log("{Search2 Function} Link recieved is: " + url);
    return url;
}

async function play(message, query) {
    let url = await search(query);
    dst.play(message, url)
};

async function join(message) {
    const connection = joinVoiceChannel({
        channelId: message.member?.voice.channel?.id,
        guildId: message.guild?.id,
        adapterCreator: message.guild?.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator
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
    if (!message.content.startsWith(`${prefix}`)) return

    const content = String(message);
    const args = content.substr(content.indexOf(' ') + 1);
    console.log("Arguments recieved: " + args);
    const serverQueue = queue.get(message.guild?.id);

    if (message.content.startsWith(`${prefix}play`)) {
        play(message, args);
    }
    if (message.content.startsWith(`${prefix}join`)) {
        join(message);
    }
});

dst
    .on('playSong', (message, song) => {
        console.log(`Start playing: ${song}`);
    })

client.login(token);