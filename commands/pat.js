const Discord = require("discord.js");
const imageSearch = require("node-google-image-search");


var results = imageSearch('anime pat', null, 0, 10);
module.exports.run = async (bot, message, args) => {
    let person = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));



    let pat_embed = new Discord.RichEmbed()
        .addField(`<@${message.author.id}> acariciou <@${person.id}>`)
        .setImage()

    if (person) {

    } else {
        return message.channel.send(`Não encontrei ninguém chamado ${person} no servidor.`);
    }
}

module.exports.help = {
    name: "pat"
}