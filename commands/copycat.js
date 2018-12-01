const Discord = require('discord.js');
const botconfig = require('../botconfig.json');

module.exports.run = async (bot, message, args) => {
    return message.channel.send('Este comando não está disponível no momento, tente mais tarde.');
    // if (!collector)
    //     message.channel.send(new Discord.RichEmbed()
    //         .setDescription('Copycat **ativado**.')
    //         .setColor('#00FF00'));
    // 
    // const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);
    // 
    // collector.on('collect', copy_msg => {
    //     if (copy_msg.content === `${botconfig.prefix}${this.help.name}`) {
    //         collector.stop();
    //     } else {
    //         message.channel.send(copy_msg.content);
    //         return collector.collected.deleteAll();
    //     }
    // });
    // 
    // collector.on('end', () => {
    //     return message.channel.send(new Discord.RichEmbed()
    //         .setDescription('Copycat **desativado**.')
    //         .setColor('#FF0000'));
    // })
}

module.exports.help = {
    name: "copycat"
}