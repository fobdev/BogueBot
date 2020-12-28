const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    let filename = '';
    let attachment;
    switch (args[0]) {
        case 'prime':
            filename = 'bogueprime.jpg';
            attachment = new Discord.MessageAttachment(filename);

            await message.channel.send(new Discord.MessageEmbed()
                .setTitle("Bogue Prime")
                .attachFile(attachment)
                .setImage(`attachment://${filename}`)
                .setColor("#00FF00"));
            break;
        case 'pixel':
            filename = 'boguepixel.jpg';
            attachment = new Discord.MessageAttachment(filename);

            await message.channel.send(new Discord.MessageEmbed()
                .setTitle("Bogue Pixel")
                .attachFile(attachment)
                .setImage(`attachment://${filename}`)
                .setColor("#00FF00"));
            break;
        default:
            filename = 'bogue.jpg';
            attachment = new Discord.Attachment(filename);

            await message.channel.send(new Discord.MessageEmbed()
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