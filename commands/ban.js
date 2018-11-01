const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async(bot, message, args) => {

    let ban_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!ban_user) return message.channel.send("**Usuário não encontrado.**");

    let ban_reason = args.join(" ").slice(22);

    if (ban_reason === "") {
        const banfail_embed = new Discord.RichEmbed()
            .setTitle("Uso incorreto do comando")
            .setColor("#FF0000")
            .addField("Você deve adicionar o motivo pelo qual está banindo esse usuário",
                "**Tenta usar: **``" + `${botconfig.prefix}ban [@usuário] [motivo]` +
                "``**\nOu usa: **``" + `${botconfig.prefix}help ban` +
                "``**\npara informação detalhada sobre o comando**")
        message.channel.send(banfail_embed);

    } else {
        const ban_embed = new Discord.RichEmbed()
            .setAuthor(`${bot.user.username} Ban Hammer`, bot.user.displayAvatarURL)
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
            .setColor("#FF0000")
            .addField("Usuário banido", `| ${ban_user} | ID: ${ban_user.id}`)
            .addField("Motivo", ban_reason);

        message.guild.member(ban_user).ban(ban_reason);
        message.channel.send(ban_embed);

        console.log(`User '${message.author.username}'` +
            ` sent [${message}] at server '${message.guild.name}' `);
    }
    return;
}

module.exports.help = {
    name: "ban"
}