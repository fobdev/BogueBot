const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    let bot_description = "A discord bot by Fobenga just for study porpuses.";
    let bot_embed = new Discord.RichEmbed()
        .setDescription(bot_description)
        .setColor("#FF0000")
        .setThumbnail(bot.user.displayAvatarURL)
        .addField("My name", bot.user.username)
        .addField("My goal", "Study porpuses.")
        .addField("Created at", bot.user.createdAt);


    return message.channel.send(bot_embed);
}

module.exports.help = {
    name: "botinfo"
}