const Discord = require('discord.js');
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args) => {
    let fullmsg = args.join(" ");
    let minimum = parseInt(args[0]);

    // check if the message is parsable
    if (!isNaN(fullmsg)) {
        // numeric roll
        if (minimum < 1)
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle('Uso incorreto do comando')
                .setDescription(
                    '``' + `${botconfig.prefix}${this.help.name}` + '``\n' +
                    '``' + `${botconfig.prefix}${this.help.name} [${this.help.arg[1]}]` + '``\n' +
                    '``' + `${botconfig.prefix}${this.help.name} [${this.help.arg.join('] [')}]` + '``')
                .setColor('#FF0000'));
        else if (!minimum)
            return message.channel.send(`**${message.author.username}** rolou **${Math.floor(Math.random() * 100 + 1)}**`);
        else
            return message.channel.send(`**${message.author.username}** rolou **${Math.floor(Math.random() * minimum + 1)}**`);
    } else
        // text roll
        return message.channel.send(`${fullmsg}: **${Math.floor(Math.random() * 100 + 1)}**`)
}

module.exports.help = {
    name: 'roll',
    descr: 'Rola um número entre dois valores ou entre 1 e 100 se nenhum valor for explicitado.',
    arg: ['minimo', 'maximo', 'texto']
}