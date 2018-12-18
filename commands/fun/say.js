const Discord = require('discord.js');
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args) => {
    let output = args.join(' ');

    if (!output)
        return message.channel.send(new Discord.RichEmbed()
            .setTitle('Uso incorreto do comando')
            .setDescription("``" + `${botconfig.prefix}${this.help.name} [${this.help.arg}]` + "``")
            .setColor('#FF0000'));


    return message.channel.send(output);
}

module.exports.help = {
    name: 'say',
    descr: `Faz o bot enviar uma mensagem escrita pelo usuário`,
    arg: ['mensagem']
}