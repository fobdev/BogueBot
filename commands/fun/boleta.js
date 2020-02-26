const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    let filename = 'boleta.jpeg';
    let attachment = new Discord.Attachment(filename);
    await message.channel.send(new Discord.RichEmbed()
        .setTitle("Parabéns Zé.")
        .attachFile(attachment)
        .setImage(`attachment://${filename}`)
        .setColor("#00FF00"));
}

module.exports.help = {
    name: 'boleta',
    descr: `Boleta`
}