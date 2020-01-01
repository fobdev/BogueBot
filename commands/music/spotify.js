const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first() || message.author;
    let upr = user.presence.activity;
    if (user.presence.activity !== null &&
        upr.type === 'LISTENING' &&
        upr.name === 'Spotify' &&
        upr.assets !== null) {
        let trackImgURL = `https://i.scdn.co/image/${upr.assets.largeImage.slice(8)}`;
        let trackUrl = `https://open.spotify.com/track/${upr.syncID}`;
        const spotifyEmoji = 'https://cdn.discordapp.com/emojis/408668371039682560.png';

        return message.channel.send(new Discord.RichEmbed()
            .setAuthor(`Música que ${user.username} está ouvindo no Spotify.`, spotifyEmoji)
            .setThumbnail(trackImgURL)
            .addField('Nome', upr.details, true)
            .addField('Album', upr.assets.largeText, true)
            .addField('Autor', upr.state, true)
            .addField('Ouvir a música: ', `[\`${trackUrl}\`](trackUrl)`, false)
            .setColor(0x1ED760));
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle("Uso incorreto do comando.")
            .setDescription("O usuário que enviou a mensagem, ou o usuário que foi marcado na mensagem não estão ouvindo nada no Spotify.")
            .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: "spotify",
    descr: 'Exibe informações sobre o que o usuário está ouvindo no spofity.',
    arg: ['usuário']
}