const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {

    let r_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reason = args.join(" ").slice(22);

    if (!r_user)
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Usuário não encontrado no servidor **${message.guild.name}**.`)
            .setColor("#FF0000"));

    if (reason === "")
        return message.channel.send(new Discord.MessageEmbed()
            .addField("Você deve especificar um motivo para denunciar um membro",
                "``" + `${botconfig.prefix}${this.help.name} [${this.help.arg.join('] [')}]` + "``")
            .setColor("#FF0000"));
    else {
        message.delete();

        // Message that goes to the guild owner
        message.guild.owner.send(new Discord.MessageEmbed()
            .setAuthor('Aviso de denúncia')
            .setTitle('Um usuário foi denunciado em seu servidor.')
            .setDescription(`Servidor: **${message.guild.name}**`)
            .addField("Usuário", `| ${r_user} | ID: ${r_user.id}`)
            .addField("Motivo", reason)
            .setThumbnail(r_user.user.displayAvatarURL())
            .setFooter(`Denunciado por ${message.author.username}`, message.author.displayAvatarURL())
            .setColor('#FFE100'));

        // Message that goes to the guild
        return message.channel.send(new Discord.MessageEmbed()
            .setColor("#00FF00")
            .setTitle("Mensagem de denúncia enviada ao dono do servidor")
            .addField("Usuário", `| ${r_user} | ID: ${r_user.id}`)
            .addField("Motivo", reason)
            .setThumbnail(r_user.user.displayAvatarURL())
            .setFooter(`Denunciado por ${message.author.username}`, message.author.displayAvatarURL()));
    }
}

module.exports.help = {
    name: "report",
    descr: 'Denuncia um membro do servidor.',
    arg: ['membro', 'motivo']
}