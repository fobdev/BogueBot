const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if (args[0] == 'prime') {
        let filename = 'bogueprime.jpg';
        let attachment = new Discord.Attachment(filename);

        await message.channel.send(new Discord.RichEmbed()
            .setTitle("Bogue Prime")
            .attachFile(attachment)
            .setImage(`attachment://${filename}`)
            .setColor("#00FF00"));
    }
}

module.exports.help = {
    name: 'bogue',
    descr: `Bogue Prime`
}