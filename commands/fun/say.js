const Discord = require('discord.js');
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    let prefix = await (await main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
    let output = args.join(' ');

    if (!output)
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Uso incorreto do comando')
            .setDescription("``" + `${prefix}${this.help.name} [${this.help.arg}]` + "``")
            .setColor('#FF0000'));


    await message.channel.send(`\u200B` + output); // '\u200B prevent from bot requesting self commands
    return message.delete();
}

module.exports.help = {
    name: 'say',
    descr: `Faz o bot enviar uma mensagem escrita pelo usuário.`,
    arg: ['mensagem']
}