const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    var dice = Math.floor(Math.random() * 6) + 1;

    return message.channel.send(`<@${message.author.id}> jogou o dado e parou em **${dice}**`);
}

module.exports.help = {
    name: 'dice'
}