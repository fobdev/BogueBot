const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {

    /*
        WARNING:
        This is a global message and needs to be sent only in a OBLIGATORY situation.
        Do not use this command if it's not NEEDED.
        Only use this command in LOCAL and re-comment it after using

        - This can cause a lot of SPAM and SHOULD NOT be abused -
    */

    // if (message.author.id === '244270921286811648') {
    //     var allguilds = bot.guilds.array();
    //     for (let i = 0; i < allguilds.length; i++) {
    //         console.log(`guild ${i}: ${allguilds[i].name}`)
    //         const system_channel = allguilds[i].channels.find(ch => ch.id === allguilds[i].systemChannelID);
    // 
    //         if (system_channel) {
    //             system_channel.send(new Discord.RichEmbed()
    //                 .addField(`**O ${bot.user.username} foi atualizado.**`, "Use ``>help music`` para ver todos os comandos de música disponiveis.\n" +
    //                     "O BogueBot tem música de alta qualidade e sem gargalos nem travamentos, com sistema de filas e vários comandos de manipulação.")
    //                 .setColor("#00FF00")
    //                 .setFooter(`Enviada por ${message.author.username}`, message.author.displayAvatarURL));
    //             console.log(`SUCESS: [${allguilds[i]}] - Message sent sucessfully to System Channel`);
    //         } else console.log(`FAIL: [${allguilds[i]}] - Does not have System Channel`);
    //     }
    // } else {
    //     return message.channel.send('Você não tem permissão para usar esse comando.');
    // }
}

module.exports.help = {
    name: 'global-message'
}