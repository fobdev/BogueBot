const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async(bot, message, args) =>
{
    const rename_embed = new Discord.RichEmbed()
        .setAuthor(`${bot.user.username} Renomear servidor`)
        .setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL);

    if (message.guild.member(message.author).hasPermission('MANAGE_GUILD'))
    {
        var newname = args.join(" ");

        if (!newname || newname.length < 2 || newname.length > 100)
        {
            return message.channel.send(rename_embed
                .setTitle("Uso incorreto do comando")
                .setColor("#FF0000")
                .addField("O nome do servidor deve ter entre 2 a 100 caracteres.",
                    "**Tente usar: **``" + `${botconfig.prefix}${this.help.name} [novo nome]` +
                    "``**\nOu usar: **``" + `${botconfig.prefix}help ${this.help.name}` +
                    "``**\nPara informação detalhada sobre o comando.**"));
        }

        try
        {
            message.guild.setName(newname);
        }
        catch (e)
        {
            return message.channel.send(rename_embed
                .setTitle("Ocorreu um erro ao renomear o servidor.")
                .setColor("#FF0000"));
        }

        return message.channel.send(rename_embed
            .setTitle(`Nome do servidor alterado de [${message.guild.name}] para [${newname}]`)
            .setColor("#00FF00"));
    }
    else
    {
        return message.channel.send(rename_embed
            .setTitle("O usuário não tem permissão para executar esse comando.")
            .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: "renameserver"
}