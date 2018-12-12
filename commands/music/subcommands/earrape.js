const Discord = require('discord.js');

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue) return message.channel.send(new Discord.RichEmbed()
        .setDescription('Não tem nada sendo tocado no momento.')
        .setColor("#FF0000"));

    if (serverQueue.streamdispatcher.speaking) {
        var sv_volume = serverQueue.connection.dispatcher.volume;
        if (sv_volume !== 1) serverQueue.connection.dispatcher.setVolume(1);

        if (sv_volume === 1) {
            serverQueue.connection.dispatcher.setVolume(200);
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`:loudspeaker: **${message.author.id}** ativou earrape.`)
                .setColor("#00FF00"));
        } else if (sv_volume === 200) {
            serverQueue.connection.dispatcher.setVolume(1);
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`:pray: O volume voltou ao normal.`)
                .setColor("#00FF00"));
        } else {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`Ocorreu um erro ao usar este comando.`)
                .setColor("#FF0000"));
        }
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setDescription('Não tem nada sendo tocado no momento.')
            .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: 'earrape'
}