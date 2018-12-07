const Discord = require("discord.js");
const botconfig = require("../../botconfig.json");

module.exports.run = async (bot, message, args) => {
    let del_arg = args.join(" ");

    var messages = "mensagem"
    if (del_arg > 1)
        messages = "mensagens";

    const delfail_embed = new Discord.RichEmbed()
        .setTitle("Uso incorreto do comando")
        .setColor("#FF0000")
        .addField("No mínimo 1 mensagem e no máximo 100 mensagens podem ser excluídas.",
            "**Tenta usar: **``" + `${botconfig.prefix}${this.help.name} [100]` + "``");

    if (del_arg > 100 || del_arg <= 0) {
        return message.channel.send(delfail_embed);
    } else {
        try {
            const perm_embed = new Discord.RichEmbed()
                .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

            if (message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')) {
                await message.delete();

                message.channel.bulkDelete(del_arg, true);
                return message.channel.send(perm_embed
                    .setTitle(`${del_arg} ${messages} foram excluídas no canal #**${message.channel.name}**`)
                    .setColor("#00FF00"));
            } else {
                return message.channel.send(perm_embed
                    .setTitle("Usuário não tem permissão para excluir mensagens.")
                    .setColor("#FF0000"));
            }
        } catch (e) {
            console.log(e);
            return message.channel.send(delfail_embed);
        }
    }
}

module.exports.help = {
    name: "clear",
}