const Discord = require('discord.js')
const music = require('../music');
const botconfig = require('../../../botconfig.json');

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue)
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Não tem nada tocando no momento.')
            .setColor("#FF0000"));

    try {
        await message.channel.send(new Discord.MessageEmbed()
            .setDescription(`**${message.author.username}** pulou **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
            .setColor("#00FF00"));

        await serverQueue.songs.shift();
        if (serverQueue.songs.length != 0)
            return music.play(bot, message, serverQueue.songs[0], null);

    } catch (e) {
        console.error('Error ending dispatcher: ');
        return console.error(e);
    }
}

module.exports.help = {
    name: 'skip',
    name_2: 's',
    static: true
}