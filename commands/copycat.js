const Discord = require('discord.js');
const botconfig = require('../botconfig.json');

module.exports.run = async (bot, message, args) => {
    if (!collector) {
        message.channel.send(new Discord.RichEmbed()
            .setDescription('Copycat **ativado**.')
            .setColor('#00FF00'));
    } else {
        collector.on('collect', collected_msg => {
            if (collected_msg.content === `${botconfig.prefix}${this.help.name}`) {
                return message.channel.send(new Discord.RichEmbed()
                    .setDescription('Copycat **desativado**.')
                    .setColor('#FF0000'));
            } else {
                return message.channel.send(`${collector.collected.array()[0].content}`);
            }
        })
    }

    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);
}

module.exports.help = {
    name: "copycat"
}