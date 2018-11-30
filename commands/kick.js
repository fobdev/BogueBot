const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('KICK_MEMBERS')) {

        let kick_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let kick_reason = args.join(" ").slice(args[0].length + 1);

        if (!kick_user) {
            return message.channel.send(new Discord.RichEmbed()
                .setDescription(`Usuário não encontrado no servidor **${message.guild.name}**`)
                .setColor("#FF0000"));
        }

        const kick_embed = new Discord.RichEmbed()
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

        if (kick_user.hasPermission('ADMINISTRATOR')) {
            return message.channel.send(kick_embed
                .setTitle("Você não pode expulsar um administrador.")
                .setColor("#FF0000"));
        }

        kick_embed.addField("Usuário foi expulso do servidor", `${kick_user}`);
        if (kick_reason === "") {
            message.guild.member(kick_user).kick();
            return message.channel.send(kick_embed
                .setColor("#00FF00"));
        } else {
            message.guild.member(kick_user).kick(kick_reason);
            return message.channel.send(kick_embed
                .setColor("#00FF00")
                .addField("Motivo", `${kick_reason}`));
        }
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle("Você não tem permissão para usar esse comando.")
            .setColor("#FF0000")
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL));
    }
    return;
}
module.exports.help = {
    name: "kick"
}