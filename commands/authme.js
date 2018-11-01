const Discord = require("discord.js");

module.exports.run = async(bot, message, args) => {

    let help = args.join(" ");;
    if (help === 'help') {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle("Authme Help"));
    } else {
        return bot.generateInvite(8)
            .then(link => message.channel.send(new Discord.RichEmbed()
                .setDescription(`Link de autenticação do ${bot.user.username}`)
                .setColor("#00FF00")
                .setThumbnail(bot.user.displayAvatarURL)
                .addField(`Use esse link para adicionar ${bot.user.username}` +
                    " em qualquer servidor:",
                    `${link}`)));
    }

}

module.exports.help = {
    name: "authme"
}