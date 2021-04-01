const Discord = require('discord.js');
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    let prefix = await (await main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
    let fullmsg = args.join(" ");
    let minimum = parseInt(args[0]);

    // check if the message is parsable
    if (!isNaN(fullmsg)) {
        // numeric roll
        if (minimum < 1)
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle('Uso incorreto do comando')
                .setDescription(
                    '``' + `${prefix}${this.help.name}` + '``\n' +
                    '``' + `${prefix}${this.help.name} [${this.help.arg[1]}]` + '``\n' +
                    '``' + `${prefix}${this.help.name} [${this.help.arg.join('] [')}]` + '``')
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