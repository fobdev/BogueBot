const Discord = require('discord.js');
const lunicode = require('lunicode');

module.exports.run = async (bot, message, args) => {
    let input = args.join(' ');
    try {
        // tries to delete but pass it if doesn't have permissions
        await message.delete();
        console.log('User message deleted.');
        return message.channel.send(lunicode.tools.creepify.encode(input));
    } catch (e) {
        console.log(`Failed to delete user message: ${e}`);
        return message.channel.send(lunicode.tools.creepify.encode(input));
    }
}

module.exports.help = {
    name: 'creepy',
    descr: `Ḯ̵͔̠̞̤͔͙̝̝̰̀̀̔̐͂̋̆̏͋͜s̸͕̜̝̪̟̍͂̊s̴̨̳͇̟̥͈͇̹̩̞̤̭͙̭͇͌̀̒͊͛̓̆͑̈͛̕͝ơ̸̡̯̫͉͍̜̞͈̹͇̝̬̹̆̔͊͊ ̸̮̞̩̣͉͕͗͗̈͋̂̆͌͐m̶̡̳̫̟̪̳̗̥̩͔̍̆ę̵̘͕̝̮͈̳̖͇̣̾̉̎͂̾̎͂̋͝s̷̫̘͇̼͖̹̑͝ͅm̵̛̛̳̖̗͋͊̽͌̔̒̓̄̔̿̇̚o̷̱̮̝͖̭͚̪͉̬̬͐`
}