const Discord = require('discord.js');
const lunicode = require('lunicode');

module.exports.run = async (bot, message, args) => {
    let input = args.join(' ');
    try {
        // tries to delete but pass it if doesn't have permissions
        await message.delete();
        return message.channel.send(lunicode.tools.creepify.encode(input));
    } catch (e) {
        return message.channel.send(lunicode.tools.creepify.encode(input));
    }
}

module.exports.help = {
    name: 'creepy',
    descr: `Ḯ̵͔̠̞̤͔͙̝̝̰̀̀̔̐͂̋̆̏͋͜s̸͕̜̝̪̟̍͂̊s̴̨̳͇̟̥͈͇̹̩̞̤̭͙̭͇͌̀̒͊͛̓̆͑̈͛̕͝ơ̸̡̯̫͉͍̜̞͈̹͇̝̬̹̆̔͊͊ ̸̮̞̩̣͉͕͗͗̈͋̂̆͌͐m̶̡̳̫̟̪̳̗̥̩͔̍̆ę̵̘͕̝̮͈̳̖͇̣̾̉̎͂̾̎͂̋͝s̷̫̘͇̼͖̹̑͝ͅm̵̛̛̳̖̗͋͊̽͌̔̒̓̄̔̿̇̚o̷̱̮̝͖̭͚̪͉̬̬͐`
}