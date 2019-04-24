const Discord = require('discord.js');
const Music = require('../music.js')

module.exports.run = async (bot, message, args, serverQueue) => {
    try {
        var dispatchertime_seconds = Math.floor(serverQueue.streamdispatcher.time / 1000);
    } catch (e) {
        return message.channel.send(new Discord.RichEmbed()
            .setDescription('Não tem nada sendo tocado no momento.')
            .setColor('#FF0000'));
    }

    var current_music = serverQueue.songs[0];
    var artist_str = `${current_music.media_artist}`;
    var album_str = `${current_music.media_album}`;
    var writers_str = `${current_music.media_writers}`;

    var isLivestream = `**${Music.util.timing(dispatchertime_seconds)} / ${Music.util.timing(serverQueue.songs[0].length)}**`;

    if (parseInt(serverQueue.songs[0].length) === 0) isLivestream = '**🔴 Livestream**';

    var now_playing_embed = new Discord.RichEmbed()
        .setAuthor(`${bot.user.username} Now Playing`, bot.user.displayAvatarURL)
        .addField("♪ Agora tocando", `**[${current_music.title}](${current_music.url})**`)
        .addField("Tempo", `${isLivestream}`, true)
        .addField("Adicionado por", `[${current_music.author}]`, true)
        .addField("Canal", `[${current_music.channel}](${current_music.channel_url})`, true)
        .setThumbnail(current_music.thumbnail)
        .setColor("#00FF00");

    if (serverQueue.songs.length > 1) now_playing_embed.addField("Restantes na fila", `**${serverQueue.songs.length - 1}**`, true);

    if (artist_str !== 'undefined') now_playing_embed.addField("Artista", `*${artist_str}*`, true);
    if (album_str !== 'undefined') now_playing_embed.addField("Álbum", `*${album_str}*`, true);
    if (writers_str !== 'undefined') now_playing_embed.addField("Escritores", `*${writers_str}*`, true);

    return message.channel.send(now_playing_embed);
}

module.exports.help = {
    name: 'np',
    name_2: 'nowplaying',
    static: true
}