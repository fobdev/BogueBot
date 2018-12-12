const Discord = require('discord.js')

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue) return message.channel.send(new Discord.RichEmbed()
        .setDescription('Não tem nada tocando no momento.')
        .setColor('$FF0000'));

    let nowplaying = serverQueue.songs[0];
    serverQueue.songs.splice(1, 0, nowplaying);

    return message.channel.send(new Discord.RichEmbed()
        .setTitle(`:repeat: **${message.author.username}** adicionou novamente à fila`)
        .setDescription(`**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
        .setColor('#00FF00'));
}

module.exports.help = {
    name: 'repeat',
    name_2: 'r'
}