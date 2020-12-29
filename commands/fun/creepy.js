const Discord = require('discord.js');
const lunicode = require('lunicode');

module.exports.run = async (bot, message, args) => {
    let input = args.join(' ');
    return message.channel.send(lunicode.tools.creepify.encode(input));
}

module.exports.help = {
    name: 'creepy',
    descr: `Ḯ̵͔̠̞̤͔͙̝̝̰̀̀̔̐͂̋̆̏͋͜s̸͕̜̝̪̟̍͂̊s̴̨̳͇̟̥͈͇̹̩̞̤̭͙̭͇͌̀̒͊͛̓̆͑̈͛̕͝ơ̸̡̯̫͉͍̜̞͈̹͇̝̬̹̆̔͊͊ ̸̮̞̩̣͉͕͗͗̈͋̂̆͌͐m̶̡̳̫̟̪̳̗̥̩͔̍̆ę̵̘͕̝̮͈̳̖͇̣̾̉̎͂̾̎͂̋͝s̷̫̘͇̼͖̹̑͝ͅm̵̛̛̳̖̗͋͊̽͌̔̒̓̄̔̿̇̚o̷̱̮̝͖̭͚̪͉̬̬͐`
}