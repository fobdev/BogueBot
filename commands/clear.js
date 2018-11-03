const Discord = require("discord.js");
const botconfig = require("../botconfig.json")

module.exports.run = async(bot, message, args) =>
{

    // let clear_user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    // if (!clear_user) return message.channel.send(new Discord.RichEmbed()
    //     .setTitle("Usuário não encontrado")
    //     .setColor("#FF0000"));

    let del_arg = args.join(" ");
    // let del_wuser = args.join(" ").slice(22);

    var messages = "mensagem"
    if (del_arg > 1)
        messages = "mensagens";

    // if (message.channel.members.find('id', clear_user.id)) {
    //     if (message.author.username === clear_user.username) {
    //         message.channel.bulkDelete(del_wuser);
    //     }
    //     return message.channel.send(`${del_arg} ${messages} de ${clear_user} foram excluídas no canal **${message.channel.name}**`);
    // }


    const delfail_embed = new Discord.RichEmbed()
        .setTitle("Uso incorreto do comando")
        .setColor("#FF0000")
        .addField("No mínimo 1 mensagem e no máximo 100 mensagens podem ser excluídas.",
            "**Tenta usar: **``" + `${botconfig.prefix}${this.help.name} [100]` +
            "``**\nOu usar: **``" + `${botconfig.prefix}help ${this.help.name}` +
            "``**\npara informação detalhada sobre o comando**");

    if (del_arg > 100 || del_arg <= 0)
    {
        return message.channel.send(delfail_embed);
    }
    else
    {
        try
        {
            const perm_embed = new Discord.RichEmbed();

            if (message.guild.member(message.author).hasPermission('MANAGE_MESSAGES'))
            {
                await message.delete();

                message.channel.bulkDelete(del_arg);
                return message.channel.send(perm_embed
                    .setTitle(`${del_arg} ${messages} foram excluídas no canal #**${message.channel.name}**`)
                    .setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL)
                    .setColor("#00FF00"));
            }
            else
            {
                return message.channel.send(perm_embed
                    .setTitle("Usuário não tem permissão para excluir mensagens.")
                    .setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL)
                    .setColor("#FF0000"));
            }
        }
        catch (e)
        {
            console.log(e);
            return message.channel.send(delfail_embed);
        }
    }
}

module.exports.help = {
    name: "clear"
}