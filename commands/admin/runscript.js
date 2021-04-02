const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");
const main = require('../../BogueBot.js');
module.exports.run = async (bot, message, args) => {
    if (message.author.id === process.env.admin_id) {
        let current_servers = bot.guilds.cache.array();
        for (let i = 0; i < current_servers.length; i++) {
            try {
                await main.db.query('UPDATE guild SET name=$1 WHERE id=$2', [current_servers[i].name, current_servers[i].id]);
            } catch (e) {
                console.log(`error naming guild id:${current_servers[i].id}`);
            }
        }
    } else {
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Permissão insuficiente para executar o comando.')
            .setDescription('Apenas desenvolvedores tem acesso a esse comando.')
            .setColor('#FF0000'));
    }

}

module.exports.help = {
    name: "runscript",
    descr: "Roda um script programado pelo desenvolvedor (BILA).",
    arg: ['numero']
}