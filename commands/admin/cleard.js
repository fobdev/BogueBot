const Discord = require("discord.js");
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    let prefix = await (await main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
    let del_arg = args.join(" ");
    const delfail_embed = new Discord.MessageEmbed()
        .setTitle("Uso incorreto do comando")
        .setColor("#FF0000")
        .addField("No mínimo 1 mensagem e no máximo 100 mensagens podem ser excluídas.",
            "**Tenta usar: **``" + `${prefix}${this.help.name} [${this.help.arg[0]}]` + "``");

    if (del_arg > 100 || del_arg <= 0) {
        return message.channel.send(delfail_embed);
    } else {
        try {
            if (message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')) {
                await message.delete();
                message.channel.bulkDelete(del_arg, true);
                return console.log(`[${del_arg}] messages removed from server [${message.guild.name}]`);
            } else
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription("Usuário não tem permissão para excluir mensagens.")
                    .setColor("#FF0000"));
        } catch (e) {
            console.log(e);
            return message.channel.send(delfail_embed);
        }
    }
}

module.exports.help = {
    name: "cleard",
    descr: "Limpa uma certa quantidade de mensagens do canal silenciosamente (max. 100).",
    arg: ['numero']
}