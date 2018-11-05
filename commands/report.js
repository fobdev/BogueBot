const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    let r_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reason = args.join(" ").slice(22);

    const report_embed = new Discord.RichEmbed()
        .setFooter(`Denunciado por ${message.author.username}`, message.author.displayAvatarURL);

    if (!r_user) return message.channel.send(report_embed
        .setTitle("Usuário não encontrado.")
        .setColor("#FF0000"));

    if (reason === "") {
        message.channel.send(report_embed
            .addField("Você deve especificar um motivo para denunciar esse usuário",
                "``" + `${botconfig.prefix}${this.help.name} [@usuário] [motivo]` + "``")
            .setColor("#FF0000"));
    } else {
        message.delete();
        message.channel.send(report_embed
            .setColor("#00FF00")
            .addField("Úsuário denunciado", `| ${r_user} | ID: ${r_user.id}`)
            .addField("Motivo", reason)
            .setThumbnail(r_user.user.displayAvatarURL));
    }
    return;
}

module.exports.help = {
    name: "report"
}