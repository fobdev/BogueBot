const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    var current_servers = bot.guilds.array();

    let members_reached = 0;
    console.log("--------------------------------------------");
    console.log(`Connected to [${current_servers.length}] servers.\nServer List:`);

    // Get the name of all the servers
    for (let i = 0; i < current_servers.length; i++) {
        let leftzero = '';
        if (i < 9) leftzero += '0';
        members_reached += current_servers[i].memberCount;
        console.log(`${leftzero}${i + 1} - [${current_servers[i]}] [${current_servers[i].memberCount} members]`);
    }
    console.log("--------------------------------------------");
    console.log(`A total of [${members_reached}] Discord users reached.`);
    console.log("--------------------------------------------");

    return bot.generateInvite(8)
        .then(link => message.channel.send(new Discord.MessageEmbed()
            .setDescription(`Link de autenticação do ${bot.user.username}`)
            .setColor("#00FF00")
            .setThumbnail(bot.user.displayAvatarURL)
            .addField(`Use esse link para adicionar ${bot.user.username}` +
                " em qualquer servidor:",
                `${link}`)));
}

module.exports.help = {
    name: "invite",
    descr: 'Mostra o link de convite do bot.'
}