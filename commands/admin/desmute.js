const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let desmute = message.guild.member(message.mentions.users.first());
        // let muterole = message.guild.roles.cache.find(role => role.name === 'mutado');

        if (!desmute) {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Uso incorreto do comando")
                .setDescription("Tente usar ``" + `${botconfig.prefix}${this.help.name} ${this.help.arg}` + "``")
                .setColor('#FF0000'));
        }


        console.log(message.channel.permissionsFor(desmute));
        if (!desmute.hasPermission('SEND_MESSAGES')) {
            try {
                message.channel.overwritePermissions([{
                    id: mute.id,
                    allow: ['SEND_MESSAGES']
                }])
            } catch (e) {
                return console.log(e);
            }
        } else {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`**${desmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
        }


        /*
        if (desmute.roles.cache.has(muterole.id)) {
            desmute.roles.remove(muterole.id);
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`**${desmute.displayName}** foi desmutado.`)
                .setColor("#00FF00"));
        } else {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`**${desmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
        }
        */
    }
}

module.exports.help = {
    name: "desmute",
    descr: 'Desmuta um membro já mutado no servidor.',
    arg: ['membro']
}