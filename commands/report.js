const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    let r_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!r_user) return message.channel.send(`**User not found.**`);

    let reason = args.join(" ").slice(22);

    if (reason === "") {
        message.channel.send("``You must have to add a reason to report this user, try using\n>report [user] [reason]``");
    } else {
        const report_embed = new Discord.RichEmbed()
            .setTitle("User Report")
            .setAuthor("BilaBot Report User", bot.user.displayAvatarURL)
            .setColor("#FF0000")
            .addField("Reported User", `| ${r_user} | ID: ${r_user.id}`)
            .addField("Reported by", `| ${message.author} | ID: ${message.author.id}`)
            .addField("Reason", reason);

        message.delete().catch(O_o => { });
        message.channel.send(report_embed);

    }
    return;
}

module.exports.help = {
    name: "report"
}