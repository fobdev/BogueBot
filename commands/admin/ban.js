const Discord = require("discord.js");
const botconfig = require("../../botconfig.json");

module.exports.run = async (bot, message, args) => {

    let ban_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let ban_reason = args.join(" ").slice(args[0].length + 1); // slices the length of the ID and the space after it
    console.log(ban_reason);

    const ban_embed = new Discord.RichEmbed()
        .setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL);

    if (!ban_user) return message.channel.send(ban_embed
        .setTitle(`Usuário não encontrado no servidor **${message.guild.name}**.`)
        .setColor("#FF0000"));

    if (ban_user.hasPermission('ADMINISTRATOR')) {
        return message.channel.send(ban_embed
            .setTitle("Você não pode banir um administrador.")
            .setColor("#FF0000"));
    }

    if (ban_reason === "") {
        message.channel.send(ban_embed
            .setTitle("Uso incorreto do comando")
            .setColor("#FF0000")
            .addField("Você deve adicionar o motivo pelo qual está banindo esse usuário",
                "**Tenta usar: **``" + `${botconfig.prefix}${this.help.name} [@usuário] [motivo]` +
                "``**\nOu usa: **``" + `${botconfig.prefix}${this.help.name} ban` +
                "``**\npara informação detalhada sobre o comando**"));
    } else {
        message.guild.member(ban_user).ban(ban_reason);

        message.channel.send(ban_embed
            .addField(`Usuário **${ban_user.displayName}** banido.`, `| ${ban_user} | ID: ${ban_user.id}`)
            .setColor("#00FF00")
            .addField("Motivo", ban_reason));
    }
    return;
}

module.exports.help = {
    name: "ban"
}