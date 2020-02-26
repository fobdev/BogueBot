const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    let ze = new Discord.Attachment('../boleta.jpeg');
    await message.channel.send(new Discord.RichEmbed()
        .setTitle("Parabéns Zé.")
        .attachFile(ze)
        .setImage(`attachment://${'boleta.jpeg'}`)
        .setColor("#00FF00"));
}

module.exports.help = {
    name: 'boleta',
    descr: `Boleta`
}