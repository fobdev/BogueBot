const Discord = require('discord.js');
const botconfig = require('../botconfig.json');

function col_recursive(message, first, collector) {
    if (first) {
        message.channel.send(new Discord.RichEmbed()
            .setDescription('Copycat **ativado**.')
            .setColor('#00FF00'));
    }

    collector.on('collect', collected_message => {
        if (collected_message.content !== `${botconfig.prefix}${this.help.name}`) {
            message.channel.send(collector.collected.array()[0].content);
            collector.stop('restart');
        } else {
            collector.stop('finished');
        }
    })

    collector.on('end', (msg, reason) => {
        switch (reason) {
            case 'restart':
                col_recursive(message, false, new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id));
                break;
            case 'finished':
                return message.channel.send(new Discord.RichEmbed()
                    .setDescription('Copycat **desativado**.')
                    .setColor('#FF0000'));
            default:
                break;
        }
    })
}

module.exports.run = async (bot, message, args) => {
    col_recursive(message, true, new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id));
}

module.exports.help = {
    name: "copycat"
}