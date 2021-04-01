const Discord = require("discord.js");
const main = require('../../BogueBot.js');

module.exports.run = async (bot, message, args) => {
    if (!args[0] || (args[0].length < 1 || args[0].length > 3)) {
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Erro ao executar o comando')
            .setDescription('Você precisa inserir um prefixo de até 3 caracteres.')
            .setColor('#FF0000'));
    } else {
        try {
            main.db.query('UPDATE guild SET prefix=$1 WHERE id=$2;', [args[0], message.guild.id])
                .then(() => {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setTitle('Prefixo modificado com sucesso')
                        .setDescription("O novo prefixo do servidor é ```" + args[0] + "```.")
                        .setColor('#FF0000'));
                })
        } catch (e) {
            return message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Erro ao trocar o prefixo do servidor`)
                .setDescription(`Ocorreu um erro, tente novamente usando outro prefixo.`)
                .setColor(`#FF000`));
        }
    }
}

module.exports.help = {
    name: "prefix",
    descr: 'Muda o prefixo do bot para o servidor atual.'
}