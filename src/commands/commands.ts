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
import * as yts from 'yt-search';
import { dst } from '..';
import { client } from '..';

export async function search(query) {
    if (String(query).startsWith("https://www.youtube.com/watch?v=")) {
        let video;
        let id;
        if (String(query).includes("&")) {
            id = String(query).substring(
                query.indexOf("=") + 1,
                query.lastIndexOf("&")
            );
        } else {
            id = String(query).substring(query.indexOf("=") + 1);
        }
        await console.log(`{Search Function} Id recieved is: ${id}`);
        let json = await yts.search({ query: id }).then((res) => res.all);
        for (let i = 0; i < json.length; i++) {
            if (json[i].videoId === id) {
                video = json[i];
            }
        }
        let url = query;
        let title = await video.title;
        let thumbnail = await video.thumbnail;
        await console.log("{Search Function} Link recieved is: " + url);
        await console.log("{Search Function} Title recieved is: " + title);
        await console.log("{Search Function} Thumbnail recieved is: " + thumbnail);
        return { url, title, thumbnail };
    } else {
        const videos = await yts.search({ query: query, pages: 1 }).then((res) => res.videos);
        const video = videos[0];
        await console.log(`{Search Function} Title recieved is: ${video.title}`);
        await console.log(`{Search Function} Thumbnail recieved is: ${video.thumbnail}`);
        await console.log(`{Search Function} Link recieved is: ${video.url}`);
        return { url: video.url, title: video.title, thumbnail: video.thumbnail };
    }
};

export async function play(message, query) {
    if (query.includes('-play')) return throwError('No query provided!');
    console.log(`Query: ${query}end`)
    const mention = await getMention(message);
    const { url, title, thumbnail } = await search(query);
    dst.play(message.member.voice.channel, url)
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Now Playing')
        .setDescription(`[${title}](${url}) [${mention}]`)
        .setThumbnail(thumbnail)
        .setAuthor(message.author.username, message.author.avatarURL())

    await message.channel.send({ embeds: [embed] });
};

export async function skip(message) {
    const queue = dst.getQueue(message);
    const songsRemaining = queue?.songs;
    if (!queue) {
        const embed = new MessageEmbed()
            .setColor('#00be94')
            .setTitle('Nothing is playing')
            .setDescription('There is nothing playing right now')
        await message.channel.send({ embeds: [embed] });
    } else if (songsRemaining?.length === 1) {
        const embed = new MessageEmbed()
            .setColor('#00be94')
            .setTitle('Queue is empty')
            .setDescription('The queue is empty, there is nothing to skip to, stopping the player')
        await message.channel.send({ embeds: [embed] });
        dst.stop(message);
    } else {
        const embed = new MessageEmbed()
            .setColor('#00be94')
            .setTitle('Skipped Song')
            .setDescription(':fast_forward:')
        await message.channel.send({ embeds: [embed] });
        dst.skip(message);
    }
};

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
};

export async function stop(message) {
    dst.stop(message);
};

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
};

export async function getMention(message) {
    const mention = '<@' + await message.member?.id + '>';
    return mention;
};

export async function leave(message) {
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle(`Left ${message.member?.voice.channel?.name}`)
        .setDescription(`:wave:`)
        .setAuthor(message.author.username, message.author.avatarURL())
    await message.channel.send({ embeds: [embed] });
    getVoiceConnection(message.guild?.id)?.destroy();
};

export async function loop(message) {
    const queue = dst.getQueue(message);
    const { RepeatMode } = require("distube");
    let mode, embed;
    if (!queue) {
        embed = new MessageEmbed()
            .setColor('#00be94')
            .setTitle('Nothing is playing')
            .setDescription('There is nothing playing right now')
    } else {
        switch (queue?.setRepeatMode(undefined)) {
            case RepeatMode.DISABLED:
                mode = "Off";
                embed = new MessageEmbed()
                    .setColor('#00be94')
                    .setTitle('Looping is disabled')
                    .setDescription(`:x:`)
                    .setAuthor(message.author.username, message.author.avatarURL())
                break;
            case RepeatMode.SONG:
                mode = "Repeat a song";
                embed = new MessageEmbed()
                    .setColor('#00be94')
                    .setTitle('Looping current song')
                    .setDescription(`:repeat_one:`)
                    .setAuthor(message.author.username, message.author.avatarURL())
                break;
            case RepeatMode.QUEUE:
                mode = "Repeat all queue";
                embed = new MessageEmbed()
                    .setColor('#00be94')
                    .setTitle('Looping queue')
                    .setDescription(`:repeat:`)
                    .setAuthor(message.author.username, message.author.avatarURL())
                break;
        }
    }
    await message.channel.send({ embeds: [embed] });
};

export async function queue(message) {
    const queue = dst.getQueue(message);
    if (!queue) {
        throwError('Nothing is playing!')
    } else {

        const queueStr =
            `${queue.songs
                .map(
                    (song, id) =>
                        `**${id ? id : 'Playing'}**. ${song.name} - \`${song.formattedDuration
                        }\``,
                )
                .slice(0, 10)
                .join('\n')}`;

        const embed = new MessageEmbed()
            .setColor('#00be94')
            .setTitle('Queue')
            .setDescription(`${queueStr}`)
            .setAuthor(message.author.username, message.author.avatarURL())
        await message.channel.send({ embeds: [embed] });
    }
};

export async function volume(message, args) {
    const queue = dst.getQueue(message);
    if (!queue) {
        throwError('Nothing is playing!')
    };
    const volume = parseInt(args);
    const oldVolume = queue?.volume;
    console.log(`${oldVolume} --> ${volume}`);
    queue?.setVolume(volume);

    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Volume Changed')
        .setDescription(`${oldVolume} --> ${volume}`)
        .setAuthor(message.author.username, message.author.avatarURL())
    await message.channel.send({ embeds: [embed] });
};

export async function nowPlaying(message) {
    const queue = dst.getQueue(message);
    if (!queue) return (throwError('Nothing is playing!'));
    const song = queue.songs[0];
    const name = song.name;
    const link = song.url;
    const duration = song.duration;
    const formattedDuration = song.formattedDuration;
    const currentTime = queue.currentTime;
    const formattedCurrentTime = queue.formattedCurrentTime;
    // @ts-ignore
    const remaining = duration - currentTime;
    var formatedRemaining = '';
    if (remaining < 3600) {
        formatedRemaining = new Date(remaining * 1000).toISOString().substr(14, 5)
    } else {
        formatedRemaining = new Date(remaining * 1000).toISOString().substr(11, 8);
    }
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Now Playing:')
        .setDescription(`[${name}](${link}) \`${formattedDuration}\``)
        // @ts-ignore
        .setThumbnail(song.thumbnail)
        .setAuthor(message.author.username, message.author.avatarURL())
        .addField('Requested by', `${song.user}`, true)
        .addField('Current Time', `${formattedCurrentTime}`, true)
        .addField('Remaining', `${formatedRemaining}`, true)
    await message.channel.send({ embeds: [embed] });
}

export async function throwError(message) {
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Error')
        .setDescription(`${message}`)
        .setAuthor(message.author.username, message.author.avatarURL())
    await message.channel.send({ embeds: [embed] });
};
