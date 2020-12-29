const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let desmute = message.guild.member(message.mentions.users.first());

        if (!desmute)
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Uso incorreto do comando")
                .setDescription("Tente usar ``" + `${botconfig.prefix}${this.help.name} ${this.help.arg}` + "``")
                .setColor('#FF0000'));

        if (!message.channel.permissionsFor(desmute).has('SEND_MESSAGES')) {
            try {
                message.channel.overwritePermissions([{
                    id: desmute.id,
                    allow: ['SEND_MESSAGES']
                }])
            } catch (e) {
                return console.log(e);
            }
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`**${desmute.displayName}** foi desmutado.`)
                .setColor("#00FF00"));
        } else
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`**${desmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: "desmute",
    descr: 'Desmuta um membro já mutado no servidor.',
    arg: ['membro']
}