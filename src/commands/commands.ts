import DiscordJS, { Message, MessageEmbed, VoiceChannel } from 'discord.js';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    DiscordGatewayAdapterCreator,
    getVoiceConnection,
} from '@discordjs/voice';
import * as yts from 'youtube-search-without-api-key'
import * as DisTube from 'distube';
import { time } from 'console';
import { title } from 'process';
const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });
const dst = new DisTube.default(client);

export async function search(query) {
    let json = await yts.search(query);
    let url = await json[0].url;
    let title = await json[0].title;
    let thumbnail = await json[0].snippet.thumbnails.url;
    await console.log("{Search Function} Link recieved is: " + url);
    await console.log("{Search Function} Title recieved is: " + title);
    await console.log("{Search Function} Thumbnail recieved is: " + thumbnail);
    return { url, title, thumbnail };
}

export async function play(message, query) {
    const mention = await getMention(message);
    const { url, title, thumbnail } = await search(query);
    dst.play(message, url)
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Now Playing')
        .setDescription(`[${title}](${url}) [${mention}]`)
        .setThumbnail(thumbnail)
        .setAuthor(message.author.username, message.author.avatarURL())
    
    await message.channel.send({ embeds: [embed] });
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

    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle(`Joined ${message.member?.voice.channel?.name}`)
        .setDescription(`:wave:`)
        .setAuthor(message.author.username, message.author.avatarURL())

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        await message.channel.send({ embeds: [embed] });
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
    const { url, title, thumbnail } = await search(query);
    const mention = await getMention(message);
    console.log(mention);
    const embed = await new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Search Result')
        .setDescription(`[${title}](${url}) [${mention}]`)
        .setThumbnail(thumbnail)
        .setAuthor(`${message.author.username}`, message.author.displayAvatarURL());
    await message.channel.send({ embeds: [embed] });
}

export async function getMention(message) {
    const mention = '<@' + await message.member?.id + '>';
    return mention;
}

export async function leave(message) {
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle(`Left ${message.member?.voice.channel?.name}`)
        .setDescription(`:wave:`)
        .setAuthor(message.author.username, message.author.avatarURL())
    await message.channel.send({ embeds: [embed] });
    getVoiceConnection(message.guild?.id)?.disconnect();
}