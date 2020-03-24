const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if (args[0] == 'pixel') {
        let filename = 'boguepixel.jpg';
        let attachment = new Discord.Attachment(filename);

        await message.channel.send(new Discord.RichEmbed()
            .setTitle("Bogue Pixel")
            .attachFile(attachment)
            .setImage(`attachment://${filename}`)
            .setColor("#00FF00"));
    }
}

module.exports.help = {
    name: 'bogue',
    descr: `Bogue Pixelado`
}