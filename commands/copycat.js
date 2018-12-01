const Discord = require('discord.js');
const botconfig = require('../botconfig.json');

var collector;
module.exports.run = async (bot, message, args) => {
    return message.channel.send('Comand indisponível no momento.');

    switch (args[0]) {
        case 'on':
            {
                if (collector) return message.channel.send('Copycat já está ativado.');

                message.channel.send(new Discord.RichEmbed()
                    .setDescription('Copycat **ativado**.')
                    .setColor('#00FF00'));

                collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);
            }
            break;
        case 'off':
            {
                if (!collector)
                    return message.channel.send('Copycat não está ativado.');
            }
            break;
        default:
            break;
    }

    if (collector) {
        collector.on('collect', collected_msg => {
            var current_msg = collector.collected.array().pop();

            if (current_msg.content === `${botconfig.prefix}${this.help.name} off`)
                return collector.stop();

            return message.channel.send(`${current_msg.content}`);
        })

        collector.on('end', () => {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription('Copycat **desativado**.')
                .setColor('#FF0000'));
        })
    }
}

module.exports.help = {
    name: "copycat"
}