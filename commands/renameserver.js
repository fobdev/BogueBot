const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    var newname = args.join(" ");
    message.guild.setName(newname);

    if (!newname || newname.lenght < 2 || newname.lenght > 100) {
        const newnamefail_embed = new Discord.RichEmbed()
            .setTitle("Incorrect use of the command")
            .setColor("#FF0000")
            .addField("The name of the server must have between 2 and 100 characters.",
                "**Try using: **``" + `${botconfig.prefix}renameserver [new name]` +
                "``**\nOr use: **``" + `${botconfig.prefix}help renameserver` +
                "``**\nFor detailed information about the command.**")

        return message.channel.send(newnamefail_embed);
    }

    return message.channel.send(new Discord.RichEmbed()
        .setTitle(`Server name changed to '${newname}'`)
        .setColor("#00FF00")
        .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL));
}

module.exports.help = {
    name: "renameserver"
}