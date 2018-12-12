const Discord = require('discord.js')

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue)
        return message.channel.send(new Discord.RichEmbed()
            .setTitle('Não tem nada tocando no momento.')
            .setColor("#FF0000"));

    try {
        if (!serverQueue.streamdispatcher.paused) {
            serverQueue.streamdispatcher.pause();
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(":pause_button: Reprodução pausada.")
                .setColor("#FFFF00"));
        } else {
            serverQueue.streamdispatcher.resume();
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(":arrow_forward: Reprodução continuada.")
                .setColor("#00FF00"));
        }
    } catch (e) {
        console.error(e);
        return message.channel.send(new Discord.RichEmbed()
            .setTitle("O comando não funcionou como o esperado.")
            .setColor("#FF0000"));
    }
}


module.exports.help = {
    name: 'p',
    name_2: 'pause'
}