const Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {
    switch (args[0]) {
        case 'prime':
            await message.channel.send(new Discord.MessageAttachment('bogueprime.jpg'));
            break;
        case 'pixel':
            await message.channel.send(new Discord.MessageAttachment('boguepixel.jpg'));
            break;
        case 'line':
            await message.channel.send(new Discord.MessageAttachment('bogueline.png'));
            break;
        default: {
            await message.channel.send(new Discord.MessageAttachment('bogue.jpg'));
            break;
        }
    }
}

module.exports.help = {
    name: 'bogue',
    descr: `Formas diversas de bogue.`
}