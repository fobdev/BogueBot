const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async(bot, message, args) => {

    const utility_commands =
        "|``help``|``clear``|``auth``|";

    const authority_commands =
        "|``mute``|``desmute``|``tempmute``|``kick``|``ban``|``report``|``renameserver``|";

    const misc_commands =
        "|``bogue``|";

    let help_embed = new Discord.RichEmbed()
        .setTitle(`${bot.user.username} Ajuda`)
        .setDescription(`Mostra todos os comandos disponíveis do ${bot.user.username} até o momento.` +
            "\n**Use ``" + `${botconfig.prefix}help [comando] ` + "`` para informação detalhada sobre o comando.**")
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL)
        .setTimestamp(bot.user.createdAt)
        .setFooter("Fobenga")
        .setColor("#00FF00")
        .addField("Utilidade", utility_commands)
        .addField("Autoridade", authority_commands);
        // .addField("Aleatórios", misc_commands);


    let helpcommand = args.join(" ");
    let field = "";

    let commands_embed = new Discord.RichEmbed()
        .setTitle(`Lista de comandos do ${bot.user.username}`)
        .setColor("#00FF00");

    switch (helpcommand) {
        case "help":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}help`,
                `Mostra todos os comandos disponíveis do ${bot.user.username} até o momento.`));
            break;
        case "auth":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}authme`,
                `Envia um link para convidar o ${bot.name} para qualquer servidor.`));
            break;
        case "clear":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}clear`,
                "Exclui um certo número de mensagens do canal que foi enviado o comando.\n" +
                "No mínimo 1 mensagem e no máximo 100 mensagens podem ser excluídas por vez.\n" +
                "**Uso: ``" + `${botconfig.prefix}clear [numero de mensagens]` + "``**"));
            break;
        case "report":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}report`,
                "Reporta um usuário\n**Uso: ``" + `${botconfig.prefix}report [@usuário] [motivo]` + "``"));
            break;
        case "renameserver":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}renameserver`,
                "Renomeia o servidor, é possível apenas criar nomes entre 2 a 100 caracteres. |" +
                " **(apenas para administradores)**\n" +
                "**Uso: ``" + `${botconfig.prefix}renameserver [novo nome]` + "``**"));
            break;
        case "kick":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}kick`,
                "Expulsa um usuário do servidor | **(apenas para administradores)**\n" +
                "**Uso:``" + `${botconfig.prefix}kick [@usuário] [motivo]` + "``**"));
            break;
        case "ban":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}ban`,
                "Banir usuário | **(apenas para administradores)**\n" +
                "**Uso:``" + `${botconfig.prefix}ban [@usuário] [motivo]` + "``**"));
            break;
        case "tempmute":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}tempmute`,
                "Silenciar um usuário temporariamente | **(apenas para administradores)**\n" +
                "**Uso:``" + `${botconfig.prefix}tempmute [@usuário] [tempo](s/m/h)` + "``**"));
            break;
        case "desmute":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}desmute`,
                "Desmuta o usuário, apenas utilizável caso o usuário já estiver mutado | **(apenas para administradores)**\n" +
                "**Uso:``" + `${botconfig.prefix}desmute [@usuário]` + "``**"));
            break;
        case "mute":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}mute`,
                "Silenciar um usuário | **(apenas para administradores)**\n" +
                "**Uso:``" + `${botconfig.prefix}mute [@usuário]` + "``**"));
            break;
        default:
            break;
    }
    return message.channel.send(help_embed);
}

module.exports.help = {
    name: "help"
}