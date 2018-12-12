const Discord = require('discord.js');

module.exports.run = async (bot, message, args, serverQueue, user_url) => {
    if (serverQueue) {
        try {
            await serverQueue.streamdispatcher.end('left');
        } catch (e) {
            console.error("Error ocurred when leaving the voice channel");
            console.error(`${e}`)
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Ocorreu um erro ao sair da sala.")
                .setColor("#FF0000"));
        }
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setDescription('O bot não está em nenhuma sala de voz.')
            .setColor("#FF0000"));
    }
}


module.exports.help = {
    name: 'leave',
    name_2: 'l'
}