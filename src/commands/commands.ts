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

export async function search(query) {
    let json = await yts.search(query);
    let url = await json[0].url;
    let title = await json[0].title;
    let thumbnail = await json[0].snippet.thumbnails.url;
    await console.log("{Search2 Function} Link recieved is: " + url);
    await console.log("{Search2 Function} Title recieved is: " + title);
    await console.log("{Search2 Function} Thumbnail recieved is: " + thumbnail);
    return { url, title, thumbnail };
}

export async function play(message, query) {
    let url = await search(query)[0];
    dst.play(message, url)
};

export async function skip(message) {
    dst.skip(message);
}

export async function join(message) {
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

export async function stop(message) {
    dst.stop(message);
}

export async function searchMsg(message, query) {
    let url = await search(query)[0];
    let title = await search(query)[1];
    let thumbnail = await search(query)[2];
    await message.channel.send(url);
    await message.channel.send(title);
    await message.channel.send(thumbnail);
}