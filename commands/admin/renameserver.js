const Discord = require("discord.js");
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    let prefix = await (await main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
    if (message.guild.member(message.author).hasPermission('MANAGE_GUILD')) {
        var newname = args.join(" ");

        if (!newname || newname.length < 2 || newname.length > 100) {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Uso incorreto do comando")
                .setColor("#FF0000")
                .addField("O nome do servidor deve ter entre 2 a 100 caracteres.",
                    "**Tente usar: **``" + `${prefix}${this.help.name} [novo nome]` + "``"));
        }

        try {
            message.guild.setName(newname);
        } catch (e) {
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription("Ocorreu um erro ao renomear o servidor.")
                .setColor("#FF0000"));
        }

        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Nome alterado com sucesso.')
            .setDescription(`Nome do servidor alterado de **${message.guild.name}** para **${newname}**`)
            .setColor("#00FF00")
            .setFooter(`Alterado por ${message.author.username}`, message.author.displayAvatarURL()));
    } else {
        return message.channel.send(new Discord.MessageEmbed()
            .setDescription("O usuário não tem permissão para executar esse comando.")
            .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: "renameserver",
    descr: 'Renomeia o servidor.',
    arg: ['novo nome']
}