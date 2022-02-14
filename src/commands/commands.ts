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
import * as yts from 'youtube-search-without-api-key';
import dist, * as DisTube from 'distube';
const client = new DiscordJS.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_VOICE_STATES'] });
const dst = new DisTube.default(client, {
    leaveOnEmpty: false,
    emptyCooldown: 5000,
    leaveOnStop: false,
});
var loopvar = 0;

export async function search(query) {
    if (String(query).startsWith("https://www.youtube.com/watch?v=")) {
        const id = String(query).substring(
            query.indexOf("=") + 1,
            query.lastIndexOf("&")
        );
        await console.log(`{Search Function} Id recieved is: ${id}`);
        let json = await yts.search(query);
        let url = query;
        let title = await json[0].title;
        let thumbnail = await json[0].snippet.thumbnails.url;
        await console.log("{Search Function} Link recieved is: " + url);
        await console.log("{Search Function} Title recieved is: " + title);
        await console.log("{Search Function} Thumbnail recieved is: " + thumbnail);
        return { url, title, thumbnail };
    } else {
        let json = await yts.search(query);
        let url = await json[0].url;
        let title = await json[0].title;
        let thumbnail = await json[0].snippet.thumbnails.url;
        await console.log("{Search Function} Link recieved is: " + url);
        await console.log("{Search Function} Title recieved is: " + title);
        await console.log("{Search Function} Thumbnail recieved is: " + thumbnail);
        return { url, title, thumbnail };
    }
};

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
    const queue = dst.getQueue(message);
    const songsRemaining = queue?.songs;
    if (songsRemaining) {
        console.log(songsRemaining);
    }
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
            .setDescription('The queue is empty, there is nothing ot skip to')
        await message.channel.send({ embeds: [embed] });
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
    getVoiceConnection(message.guild?.id)?.disconnect();
};

export async function loop(message) {
    var loopstr;
    if (loopvar == 0) {
        loopstr = 'repeat';
        dst.setRepeatMode(loopstr);
        loopvar = 1;
    } else if (loopvar == 1) {
        loopstr = 'loop';
        dst.setRepeatMode(loopstr);
        loopvar = 2;
    } else {
        loopstr = 'none';
        dst.setRepeatMode(loopstr);
        loopvar = 0;
    }
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

export async function throwError(message) {
    const embed = new MessageEmbed()
        .setColor('#00be94')
        .setTitle('Error')
        .setDescription(`${message}`)
        .setAuthor(message.author.username, message.author.avatarURL())
    await message.channel.send({ embeds: [embed] });
};
