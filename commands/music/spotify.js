const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first() || message.author;
    let spotifyActivity = user.presence.activities.find(activity => activity.name = 'Spotify');
    console.log(spotifyActivity);
    if (spotifyActivity) {
        let trackImgURL = `https://i.scdn.co/image/${spotifyActivity.assets.largeImage.slice(8)}`;
        const spotifyEmoji = 'https://cdn.discordapp.com/emojis/408668371039682560.png';

        if (args[0] == 'art')
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Arte do album ${spotifyActivity.assets.largeText}, de ${spotifyActivity.state}`)
                .setImage(trackImgURL)
                .setColor("#00FF00"));
        else
            return message.channel.send(new Discord.MessageEmbed()
                .setAuthor(`Música que ${user.username} está ouvindo no Spotify.`, spotifyEmoji)
                .setThumbnail(trackImgURL)
                .addField('Nome', spotifyActivity.details, true)
                .addField('Album', spotifyActivity.assets.largeText, true)
                .addField('Autor', spotifyActivity.state, true)
                .setDescription("Clique na thumbnail da capa para ve-la em alta resolução.")
                .setColor(0x1ED760));
    } else
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Erro no comando.")
            .setDescription("Não consigo ver nada relacionado a spotify no status do usuário.")
            .setColor("#FF0000"));
}

module.exports.help = {
    name: "spotify",
    descr: 'Exibe informações sobre o que o usuário está ouvindo no spofity.',
    arg: ['usuário']
}