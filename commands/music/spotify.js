const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first() || message.author;
    if (user.presence.activity !== null &&
        user.presence.activity.type === 'LISTENING' &&
        user.presence.activity.name === 'Spotify' &&
        user.presence.activity.assets !== null) {
        let trackImgURL = `https://i.scdn.co/image/${user.presence.activity.assets.largeImage.slice(8)}`;
        let trackUrl = `https://open.spotify.com/track/${user.presence.activity.syncID}`;
        const spotifyEmoji = 'https://cdn.discordapp.com/emojis/408668371039682560.png';

        return message.channel.send(new Discord.RichEmbed()
            .setAuthor(`Música que ${user.username} está ouvindo no Spotify.`, spotifyEmoji)
            .setThumbnail(trackImgURL)
            .addField('Nome', user.presence.activity.details, true)
            .addField('Album', user.presence.activity.assets.largeText, true)
            .addField('Autor', user.presence.activity.state, true)
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