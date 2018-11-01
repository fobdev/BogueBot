const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    let kick_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!kick_user) return message.channel.send("**User not found.**");

    let kick_reason = args.join(" ").slice(22);

    const kick_embed = new Discord.RichEmbed()
        .setAuthor(`${bot.user.username} Kick`, bot.user.displayAvatarURL)
        .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

    var has_reason = kick_reason !== "";

    message.guild.member(kick_user).kick(kick_reason);

    return message.channel.send(kick_embed);
}
module.exports.help = {
    name: "kick"
}