const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    let filename = 'boleta.jpeg';
    let attachment = new Discord.MessageAttachment(filename);
    await message.channel.send(new Discord.MessageEmbed()
        .setTitle("Parabéns Zé.")
        .attachFiles(attachment)
        .setImage(`attachment://${filename}`)
        .setColor("#00FF00"));
}

module.exports.help = {
    name: 'boleta',
    descr: `Boleta`
}