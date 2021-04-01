const Discord = require("discord.js");
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let desmute = message.guild.member(message.mentions.users.first());

        if (!desmute) {
            let prefix = await (await main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Uso incorreto do comando")
                .setDescription("Tente usar ``" + `${prefix}${this.help.name} ${this.help.arg}` + "``")
                .setColor('#FF0000'));
        }

        if (!message.channel.permissionsFor(desmute).has('SEND_MESSAGES')) {
            try {
                message.channel.permissionOverwrites.get(desmute.id).delete();
            } catch (e) {
                return console.log(e);
            }
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`**${desmute.displayName}** foi desmutado.`)
                .setColor("#00FF00"));
        } else
            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`**${desmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: "desmute",
    descr: 'Desmuta um membro já mutado no servidor.',
    arg: ['membro']
}