module.exports.run = async (bot, message, args) => {
    var coin = Math.floor(Math.random() * 20);
    var coin_string = '';

    if (coin % 3 === 0)
        coin_string += "**cara**";
    else
        coin_string += "**coroa**";

    return message.channel.send(`<@${message.author.id}> jogou a moeda e caiu em ${coin_string}`);
}

module.exports.help = {
    name: 'coinflip',
    name_2: 'flipcoin',
    descr: 'Joga uma moeda para cima e exibe o resultado.'
}