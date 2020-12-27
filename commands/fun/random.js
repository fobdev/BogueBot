const Discord = require('discord.js');
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args) => {
    let minimum = await parseInt(args[0]);
    let maximum = await parseInt(args[1]);

    if (!args[0])
        return message.reply(`seu numero é **${Math.floor(Math.random() * 100 + 1)}**`);

    if (minimum < 1 || !minimum)
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Uso incorreto do comando')
            .setDescription(
                '``' + `${botconfig.prefix}${this.help.name}` + '``\n' +
                '``' + `${botconfig.prefix}${this.help.name} [${this.help.arg[1]}]` + '``\n' +
                '``' + `${botconfig.prefix}${this.help.name} [${this.help.arg.join('] [')}]` + '``')
            .setColor('#FF0000'));

    if (!maximum)
        return message.reply(`seu numero é **${Math.floor(Math.random() * minimum + 1)}**`);
    else
        return message.reply(`seu numero é **${Math.floor(Math.random() * (maximum - minimum + 1)) + minimum}**`);
}

module.exports.help = {
    name: 'random',
    descr: 'Mostra um numero aleatório entre dois valores.',
    arg: ['minimo', 'maximo']
}