const Discord = require('discord.js');
const botconfig = require("../../botconfig.json");

module.exports.run = async (bot, message, args) => {
    const music = require('../music/music.js');

    return message.channel.send(new Discord.RichEmbed()
        .setTitle(`Atualizações recentes do ${bot.user.username}.`)
        .setColor("#00FF00")
        .addField('Comando de música',
            `**${botconfig.prefix}${music.help.name_2} queue pos [video1] [video2]**\nAlterna a posição entre dois videos numa fila já criada.\n
            **${botconfig.prefix}${music.help.name_2} queue next [numero]**\nColoca o video correspondente ao número como o próximo a se tocar.\n
            **${botconfig.prefix}${music.help.name_2} queue purge**\nExclui todos os vídeos da fila menos o que está sendo executado no momento.\n
            **${botconfig.prefix}${music.help.name_2} earrape**\nFaz um efeito de earrape na reprodução atual.`)
        .addField('\u200B', "Para todos os comandos de música disponíveis, use ``>help music``"));
}

module.exports.help = {
    name: 'news'
}