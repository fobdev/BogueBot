const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {
    let ban_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let ban_reason = args.join(" ").slice(args[0].length + 1); // slices the length of the ID and the space after it

    const report_file = require('./report.js');
    if (!message.guild.member(message.author).hasPermission('BAN_MEMBERS'))
        return message.channel.send(new Discord.RichEmbed()
            .setTitle('Você não tem permissão para banir membros desse servidor.')
            .setDescription("Ao invés disso, use ``" + `${botconfig.prefix}${report_file.help.name} [${report_file.help.arg.join('] [')}]` + "``")
            .setColor('#FF0000'));

    if (!ban_user)
        return message.channel.send(Discord.RichEmbed()
            .setTitle(`Usuário não encontrado no servidor **${message.guild.name}**.`)
            .setDescription('Use **@** para identificar o usuário corretamente.')
            .setColor("#FF0000"));

    if (ban_user.hasPermission('ADMINISTRATOR')) {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle(`**${ban_user.displayName}** é administrador desse servidor e não pode ser expulso.`)
            .setColor("#FF0000"));
    }

    if (ban_reason === "")
        return message.channel.send(Discord.RichEmbed()
            .setTitle("Uso incorreto do comando")
            .setColor("#FF0000")
            .addField("Você deve adicionar o motivo pelo qual está banindo esse usuário",
                "**Tenta usar: **``" + `${botconfig.prefix}${this.help.name} [@usuário] [motivo]` +
                "``**\nOu usa: **``" + `${botconfig.prefix}${this.help.name} ban` +
                "``**\npara informação detalhada sobre o comando**"));
    else {
        try {
            await message.guild.member(ban_user).ban(ban_reason);
        } catch (e) {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`Permissões insuficientes para banir **${ban_user.displayName}**.`)
                .setDescription("Ao invés disso, use ``" + `${botconfig.prefix}${report_file.help.name} [${report_file.help.arg.join('] [')}]` + "``")
                .setColor('#FF0000'));
        }

        return message.channel.send(new Discord.RichEmbed()
            .addField(`Usuário **${ban_user.displayName}** banido.`, `| ${ban_user} | ID: ${ban_user.id}`)
            .setThumbnail(ban_user.user.displayAvatarURL)
            .setColor("#00FF00")
            .addField("Motivo", ban_reason)
            .setFooter(`Banido por ${message.author.username}`));
    }
}

module.exports.help = {
    name: "ban",
    descr: "Bane um usuário do servidor.",
    arg: ['membro', 'motivo']
}