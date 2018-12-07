const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    var current_servers = bot.guilds.array();

    console.log("---------------------------------");
    console.log(`Currently connected to [${current_servers.length}] servers.\nServer List:`);
    for (var i = 0; i < current_servers.length; i++) {
        console.log(`${i + 1} - [${current_servers[i]}]`);
    }
    console.log("---------------------------------");

    return bot.generateInvite(8)
        .then(link => message.channel.send(new Discord.RichEmbed()
            .setDescription(`Link de autenticação do ${bot.user.username}`)
            .setColor("#00FF00")
            .setThumbnail(bot.user.displayAvatarURL)
            .addField(`Use esse link para adicionar ${bot.user.username}` +
                " em qualquer servidor:",
                `${link}`)));
}

module.exports.help = {
    name: "invite"
}