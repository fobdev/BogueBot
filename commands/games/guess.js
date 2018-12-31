// This is a prototype
const Discord = require('discord.js');
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args) => {
    let incorrect_input = new Discord.RichEmbed()
        .setTitle('Uso incorreto do comando')
        .setDescription("``" + `${botconfig.prefix}${this.help.name} [${this.help.arg[0]}]` + "``")
        .setColor('#FF0000');

    if (!args[0])
        return message.channel.send(incorrect_input)

    // This collector only will get the message from the caller of the game
    let game_collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);

    // Default values for maximum and minimum, that will change depending on the difficulty selected
    let gameconfig = {
        maximum: Math.floor(Math.random() * 899) + 100, // random between 100 and 1000
        minimum: Math.floor(Math.random() * 100) + 1, // random between 1 and 100
        tries: 5,
        trycount: 0,
        title: ''
    }

    switch (args[0]) {
        case '1':
            gameconfig.tries = 15;
            break;
        case '2':
            gameconfig.tries = 10;
            break;
        case '3':
            gameconfig.tries = 5;
            break;
        default:
            return message.channel.send(incorrect_input)
    }

    let random_number = Math.floor(Math.random() * (gameconfig.maximum - gameconfig.minimum + 1)) + gameconfig.minimum;
    message.channel.send(new Discord.RichEmbed()
        .setTitle('Adivinha o número')
        .setDescription(`Seu numero secreto está entre **${gameconfig.minimum}** e **${gameconfig.maximum}.**
        Você tem ${gameconfig.tries} chances de acerta-lo.
        
        Use ` + "``stop`` para terminar o jogo a qualquer momento.")
        .setColor('#00ffe5'))

    await console.log(`answer: ${random_number}`);
    game_collector.on('collect', u_msg => {
        if (parseInt(u_msg.content) > gameconfig.maximum)
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Valor superior ao máximo')
                .setDescription(`**${u_msg.content}** é maior que o valor máximo de **${gameconfig.maximum}**`)
                .setColor('#FF0000'))

        if (parseInt(u_msg.content) < gameconfig.minimum)
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Valor inferior ao mínimo')
                .setDescription(`**${u_msg.content}** é menor que o valor mínimo de **${gameconfig.minimum}**`)
                .setColor('#FF0000'))

        if (u_msg.content === 'stop')
            return game_collector.stop('forced')

        if (parseInt(u_msg.content) === random_number) {

            console.log(gameconfig.trycount);
            if (gameconfig.trycount <= 11) gameconfig.title = 'Devagar';
            if (gameconfig.trycount <= 9) gameconfig.title = 'Azilado';
            if (gameconfig.trycount <= 7) gameconfig.title = 'Frio e calculista';
            if (gameconfig.trycount <= 3) gameconfig.title = 'Deus';
            if (gameconfig.trycount <= 1) gameconfig.title = 'Cagada';

            game_collector.stop();
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Vitória')
                .setDescription('Parabéns, você acertou o numero secreto!')
                .addField('Estatísticas',
                    `**Numero secreto:** ${random_number}
                    **Numeros tentados:** ${gameconfig.trycount + 1}
                    **Tentativas restantes:** ${gameconfig.tries - 1}
                    **Título:** ${gameconfig.title}`)
                .setColor('#00FF00'));
        }

        if (gameconfig.tries === 1) return game_collector.stop('gameover');

        let dist = parseInt(u_msg.content) - random_number;

        let tryplural = 'tentativa restante';
        if (gameconfig.tries > 2) tryplural = 'tentativas restantes';

        if (dist < 10) color = '#26ff00';
        if (dist >= 10) color = '#aaff00';
        if (dist >= 20) color = '#e1ff00';
        if (dist >= 50) color = '#ffe500';
        if (dist >= 100) color = '#ffaa00';
        if (dist >= 200) color = '#ff5900';
        if (dist >= 300) color = '#ff0000';

        if (parseInt(u_msg.content) < random_number) {
            gameconfig.trycount++;
            gameconfig.tries--;
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`**${u_msg.content}** é **menor** que o numero secreto, tente novamente.`)
                .setDescription(`${gameconfig.tries} ${tryplural}.`)
                .setColor(color))
        }

        if (parseInt(u_msg.content) > random_number) {
            gameconfig.trycount++;
            gameconfig.tries--;
            return message.channel.send(new Discord.RichEmbed()
                .setTitle(`**${u_msg.content}** é **maior** que o numero secreto, tente novamente.`)
                .setDescription(`${gameconfig.tries} ${tryplural}.`)
                .setColor(color))
        }
    })

    game_collector.on('end', (msg, reason) => {
        switch (reason) {
            case 'gameover':
                return message.channel.send(new Discord.RichEmbed()
                    .setTitle('Game Over!')
                    .setDescription(`Você perdeu todas as suas tentativas.
                    O número secreto era **${random_number}**.`)
                    .setColor('#FF0000'));
            case 'forced':
                return message.channel.send(new Discord.RichEmbed()
                    .setTitle('Game Over!')
                    .setDescription(`Jogo terminado pelo usuário.
                    O número secreto era **${random_number}**.`)
                    .setColor('#FF0000'));
            default:
                break;
        }
    })

}

module.exports.help = {
    name: 'guess',
    descr: 'Jogo de adivinhação de números.',
    arg: ['dificuldade (1 | 2 | 3)']
}