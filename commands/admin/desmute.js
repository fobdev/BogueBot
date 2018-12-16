const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let desmute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let muterole = message.guild.roles.find(role => role.name === 'mutado');
        let tempmute_role = message.guild.roles.find(role => role.name === 'mute temporário');

        if (!desmute) {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Uso incorreto do comando")
                .setDescription("Tente usar ``" + `${botconfig.prefix}${this.help.name} ${this.help.arg}` + "``")
                .setColor('#FF0000'));
        }

        if (desmute.roles.has(muterole.id)) {
            desmute.removeRole(muterole.id);

            if (desmute.roles.has(tempmute_role.id))
                desmute.removeRole(tempmute_role.id);

            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`**${desmute.displayName}** foi desmutado.`)
                .setColor("#00FF00"));
        } else {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`**${desmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
        }
    }
}

module.exports.help = {
    name: "desmute",
    descr: 'Desmuta um membro já mutado no servidor.',
    arg: ['membro']
}