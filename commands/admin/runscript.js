const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");
const main = require('../../BogueBot.js');
module.exports.run = async (bot, message, args) => {
    let current_servers = bot.guilds.cache.array();
    for (let i = 0; i < current_servers.length; i++) {
        try {
            main.db.query('INSERT INTO query(id, prefix) VALUES($1, $2)', [current_servers[i].id, botconfig.prefix])
                .then(() => console.log(`added guild id [${current_servers[i].id}] to database sucessfully.`));

        } catch (e) {
            console.log(`error adding guild id [${current_servers[i].id}] to database: ${e}`);
        }
    }
}

module.exports.help = {
    name: "runscript",
    descr: "Roda um script programado pelo desenvolvedor (BILA).",
    arg: ['numero']
}