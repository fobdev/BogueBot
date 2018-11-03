const Discord = require("discord.js")

module.exports.run = async(bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let mute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let muterole = message.guild.roles.find(role => role.name === 'mutado');

        const mute_embed = new Discord.RichEmbed()
            .setTitle(`${bot.user.username} Mutar`)
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

        if (mute.hasPermission('ADMINISTRATOR')) {
            return message.channel.send(mute_embed
                .setTitle("Você não pode silenciar um administrador.")
                .setColor("#FF0000"));
        }

        if (!muterole) {
            try {
                muterole = await message.guild.createRole({
                    name: "mutado",
                    color: "#000000",
                    permissions: []
                });

                message.guild.channels.forEach(async(channel, id) => {
                    await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false
                    });
                });
            } catch (e) {
                console.log(e.stack);
            }
        }

        if (!mute.roles.find(role => role.name === 'mutado')) {
            mute.addRole(muterole.id);
            console.log(`${message.author.username} muted user [${mute.displayName}].`);
            return message.channel.send(mute_embed
                .setTitle(`**${mute.displayName}** foi mutado.`)
                .setColor("#00FF00"));
        } else {
            return message.channel.send(mute_embed
                .setTitle(`**${mute.displayName}** já está mutado.`)
                .setColor("#FF0000"));
        }
    }
}


module.exports.help = {
    name: "mute"
}