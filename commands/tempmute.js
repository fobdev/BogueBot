const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('MANAGE_ROLES')) {
        let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if (!tomute) return message.channel.send("``User not found. Try typing @name``");

        let muterole = message.guild.roles.find(role => role.name === 'muted');

        // create a new role
        if (!muterole) {
            try {
                muterole = await message.guild.createRole({
                    name: "muted",
                    color: "#000000",
                    permissions: []
                })

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false
                    });
                });
            } catch (e) {
                console.log(e.stack);
            }
        }
        // new role made

        let mutetime = args[1];
        if (!mutetime) {
            const mute_err = new Discord.RichEmbed()
                .setTitle("Error - You Didn't especified a time.")
                .setColor("#FF0000")
                .addField("Try using:", "``>tempmute [user] [time](s/m/h)``")
                .addField("Example", "``>tempmute @user 10s``\nMutes the user for 10 seconds")
                .addField("Usage", "s - seconds \nm - minutes\nh - hours");

            return message.channel.send(mute_err);
        }
        await (tomute.addRole(muterole.id));
        message.channel.send(`**<@${tomute.id}> has been muted for ${ms(ms(mutetime))}**`);
        console.log(`${message.author.username} muted user [${tomute.displayName}] for ${ms(ms(mutetime))}.`);

        setTimeout(function () {
            tomute.removeRole(muterole.id);
            message.channel.send(`**<@${tomute.id}> has been unmuted.**`);
            console.log(`User[${tomute.displayName}] has been unmuted.`);
        }, ms(mutetime));
    } else {
        return message.channel.send(new RichEmbed()
            .setTitle("Você não tem permissão para usar esse comando.")
            .setColor("#FF0000")
            .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL));
    }
    return;
}


module.exports.help = {
    name: "tempmute"
}