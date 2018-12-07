const Discord = require("discord.js");
const botconfig = require("../../botconfig.json");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let unmute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let muterole = message.guild.roles.find(role => role.name === 'mutado');


        const unmute_embed = new Discord.RichEmbed()
            .setTitle(`${bot.user.username} Desmutar`)
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

        if (!unmute) {
            return message.channel.send(unmute_embed
                .setTitle("Uso incorreto do comando")
                .addField("Tente usar", `${botconfig.prefix}${this.help.name} [@user]`));
        }

        if (!muterole) {
            return message.channel.send(unmute_embed
                .setTitle(`**${unmute.displayName}** não está mutado.`)
                .setColor("#FF0000"));
        } else {
            unmute.removeRole(muterole.id);

            return message.channel.send(unmute_embed
                .setTitle(`**${unmute.displayName}** foi desmutado.`)
                .setColor("#00FF00"));
        }
    }
}

module.exports.help = {
    name: "desmute"
}