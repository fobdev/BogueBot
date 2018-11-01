const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async(bot, message, args) => {

    let kick_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!kick_user) return message.channel.send("**User not found.**");

    let kick_reason = args.join(" ").slice(22);

    if (kick_reason === "") {
        const kickfail_embed = new Discord.RichEmbed()
            .setTitle("Incorrect use of the command")
            .setColor("#FF0000")
            .addField("You must have to add a reason to kick this user",
                "**Try using: **``" + `${botconfig.prefix}kick [user] [reason]` +
                "``**\nOr use: **``" + `${botconfig.prefix}help kick` +
                "``**\nFor detailed information about the command.**")
        message.channel.send(kickfail_embed);
    } else {
        const kick_embed = new Discord.RichEmbed()
            .setAuthor(`${bot.user.username} matou <@${kick_user}>`, bot.user.displayAvatarURL)
            .setColor("#FF0000")
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
            .addField("Usuario expulso", `| ${kick_user} | ID: ${kick_user.id}`)
            .addField("Motivo", kick_reason);

        message.guild.member(kick_user).kick(kick_reason);
        message.channel.send(kick_embed);

    }
    return;
}

module.exports.help = {
    name: "kick"
}