const Discord = require('discord.js');
const boletafile = require.main.require("./boleta.jpeg");

module.exports.run = async (bot, message, args) => {
    let ze = new Discord.Attachment(boletafile);
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