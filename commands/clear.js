const Discord = require("discord.js");
const botconfig = require("../botconfig.json")

module.exports.run = async(bot, message, args) => {

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
            "**Tenta usar: **``" + `${botconfig.prefix}clearme [100]` +
            "``**\nOu usa: **``" + `${botconfig.prefix}help clearme` +
            "``**\npara informação detalhada sobre o comando**");

    if (del_arg > 100 || del_arg === "" || del_arg <= 0) {
        return message.channel.send(delfail_embed);
    } else {
        try {
        	message.delete();
            message.channel.bulkDelete(del_arg);
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`${del_arg} ${messages} foram excluídas no canal **${message.channel.name}**`)
                .setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL)
                .setColor("#00FF00"));

        } catch (TypeError) {
            console.log("Invalid input, code did not executed as expected.");
            return message.channel.send(delfail_embed);
        }
    }
}

module.exports.help = {
    name: "clear"
}