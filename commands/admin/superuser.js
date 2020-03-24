const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if (message.author.id === "244270921286811648") {

        // fill up the guilds array.
        let current_servers = bot.guilds.array();
        let guildstring = "";
        let membercount = 0;
        for (let i = 0; i < current_servers.length; i++) {
            let leftzero = "";
            if (i < 9) leftzero += "0";
            membercount += current_servers[i].memberCount;
            guildstring += `${leftzero}${i + 1} - [${current_servers[i]}] [${current_servers[i].memberCount} membros]`;

            if (current_servers[i].memberCount >= 5000)
                guildstring += ' (user overload)';
        }

        switch (args[0]) {
            case 'serverlist': {
                try {
                    return message.channel.send("```" + guildstring + `\nUm total de [${membercount}] usuários alcançados` + "```");
                } catch (e) {
                    console.log("--------------------------------------------");
                    console.log(`Connected to [${current_servers.length}] servers.\nServer List:`);

                    console.log(guildstring);

                    console.log("--------------------------------------------");
                    console.log(`A total of [${membercount}] Discord users reached.`);
                    console.log("--------------------------------------------");
                    return message.channel.send(new Discord.RichEmbed()
                        .setTitle("Lista de servidores muito grande.")
                        .setDescription("A lista de servidores foi enviada para a HerokuCLI pois a lista é maior que o limite de 2000 caracteres.")
                        .setColor('#FFFF00'));
                }
            }
            case 'leaveserver': {
                if (args[1]) {
                    try {
                        current_servers[parseInt(args[1] - 1)].leave().then(g => console.log(`Boguebot left the guild [${g}]`));
                    } catch (e) {
                        message.channel.send(new Discord.RichEmbed()
                            .setTitle('Erro ao sair do servidor.')
                            .setDescription("Verifique corretamente a entrada numérica e tente novamente.\nLogs de erros enviados ao HerokuCLI.")
                            .setColor('#FF0000'));

                        console.log('An error ocurred trying to leave the designated server, try again.');
                        console.log(e);
                    }

                } else {
                    return message.channel.send(new Discord.RichEmbed()
                        .setTitle('Erro no comando.')
                        .setDescription("É necessário selecionar um servidor (numero) para sair.")
                        .setColor("#FF0000"));
                }
            }
            break;
        default:
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Erro no comando.")
                .setDescription("Selecione uma ação: \n1 - serverlist\n2 - leaveserver")
                .setColor("#FF0000"));
        }
    } else {
        return message.channel.send(
            new Discord.RichEmbed()
            .setDescription("Comando disponível apenas para desenvolvedores do BogueBot.")
            .setColor("#FF0000")
        );
    }
};

module.exports.help = {
    name: "superuser"
};