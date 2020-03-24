const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {

    switch (args[0]) {
        case 'prime':
            let filename = 'bogueprime.jpg';
            let attachment = new Discord.Attachment(filename);

            await message.channel.send(new Discord.RichEmbed()
                .setTitle("Bogue Prime")
                .attachFile(attachment)
                .setImage(`attachment://${filename}`)
                .setColor("#00FF00"));
            break;
        case 'pixel':
            let filename = 'boguepixel.jpg';
            let attachment = new Discord.Attachment(filename);

            await message.channel.send(new Discord.RichEmbed()
                .setTitle("Bogue Pixel")
                .attachFile(attachment)
                .setImage(`attachment://${filename}`)
                .setColor("#00FF00"));
            break;
        default:
            let filename = 'bogue.jpg';
            let attachment = new Discord.Attachment(filename);

            await message.channel.send(new Discord.RichEmbed()
                .setTitle("Bogue")
                .attachFile(attachment)
                .setImage(`attachment://${filename}`)
                .setColor("#00FF00"));
            break;
    }
}

module.exports.help = {
    name: 'bogue',
    descr: `Formas diversas de bogue.`
}