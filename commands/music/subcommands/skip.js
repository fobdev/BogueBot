const Discord = require('discord.js')

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue)
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Não tem nada tocando no momento.')
            .setColor("#FF0000"));

    try {
        serverQueue.streamdispatcher.end('skipped');
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