const Discord = require('discord.js')
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args, serverQueue) => {
    if (!serverQueue) return message.channel.send(new Discord.RichEmbed()
        .setDescription('Não tem nada tocando no momento.')
        .setColor('$FF0000'));

    if (!args[1]) {
        serverQueue.songs.splice(1, 0, serverQueue.songs[0]);
        return message.channel.send(new Discord.RichEmbed()
            .setTitle(`:repeat: **${message.author.username}** adicionou novamente à fila`)
            .setDescription(`**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
            .setColor('#00FF00'));
    } else {
        if (args[1] > 0) {
            let adder = parseInt(args[1]);
            for (let i = 0; i < adder; i++)
                serverQueue.songs.splice(1, 0, serverQueue.songs[0]);

            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`:repeat: **${message.author.username}** adicionou novamente à fila **(${adder}x)**`)
                .setDescription(`**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
                .setColor('#00FF00'));


        } else {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Uso incorreto do comando.')
                .setDescription("Tente usar: ``" + `${botconfig.prefix}${this.help.name} [${this.help.arg[0]}]` + "``")
                .setColor('#FF0000'));
        }
    }
}

module.exports.help = {
    name: 'repeat',
    name_2: 'r',
    arg: ['numero'],
    static: false
}