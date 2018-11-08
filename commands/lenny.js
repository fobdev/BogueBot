const Discord = require("discord.js");

var entry = ['( ͡° ͜ʖ ͡°)', '( ͠° ͟ʖ ͡°)', '( ͡~ ͜ʖ ͡°)', '( ͡ʘ ͜ʖ ͡ʘ)', '( ͡o ͜ʖ ͡o)', '(° ͜ʖ °)', '( ‾ʖ̫‾)', '( ಠ ͜ʖಠ)', '( ͡° ʖ̯ ͡°)', '( ͡ಥ ͜ʖ ͡ಥ)', '༼ ͡° ͜ʖ ͡° ༽', '(·̿Ĺ̯·̿ ̿)'];
var rand_val = entry[Math.floor(Math.random() * entry.length)];
module.exports.run = async (bot, message, args) => {
    console.log(`${message.author.name} got a lenny face`);

    return message.channel.send(rand_val);
}

module.exports.help = {
    name: "lenny"
}