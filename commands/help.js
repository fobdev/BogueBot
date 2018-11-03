const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) =>
{

    const utility_commands =
        "|``help``|``clear``|``auth``|";

    const authority_commands =
        "|``mute``|``desmute``|``tempmute``|``kick``|``ban``|``report``|``renameserver``|";

    const misc_commands =
        "|``bogue``|";

    const user_commands =
        "|``avatar``|"

    let help_embed = new Discord.RichEmbed()
        .setTitle(`${bot.user.username} Ajuda`)
        .setDescription(`Mostra todos os comandos disponíveis do ${bot.user.username} até o momento.` +
            "\n**Use ``" + `${botconfig.prefix}help [comando] ` + "`` para informação detalhada sobre o comando.**")
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL)
        .setTimestamp(bot.user.createdAt)
        .setFooter("Fobenga")
        .setColor("#00FF00")
        .addField("Usuário", user_commands)
        .addField("Utilidade", utility_commands)
        .addField("Autoridade", authority_commands);
    // .addField("Aleatórios", misc_commands);


    let helpcommand = args.join(" ");
    let field = "";

    let commands_embed = new Discord.RichEmbed()
        .setTitle(`Lista de comandos do ${bot.user.username}`)
        .setColor("#00FF00");

    switch (helpcommand)
    {
        case "help":
            return message.channel.send(commands_embed.addField(`${botconfig.prefix}${this.help.name}`,
                `Mostra todos os comandos disponíveis do ${bot.user.username} até o momento.`));
            break;
        case "avatar":
            {
                const file = require("./avatar.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Exibe o avatar em tamanho grande do membro marcado\n" +
                    `Uso: ${botconfig.prefix}${file.help.name} [@membro]`));
            }
            break;
        case "auth":
            {
                const file = require("./auth.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    `Envia um link para convidar o ${bot.name} para qualquer servidor.`));
            }
            break;
        case "clear":
            {
                const file = require("./clear.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Exclui um certo número de mensagens do canal que foi enviado o comando.\n" +
                    "No mínimo 1 mensagem e no máximo 100 mensagens podem ser excluídas por vez.\n" +
                    "**Uso: ``" + `${botconfig.prefix}${file.help.name} [numero de mensagens]` + "``**"));
            }
            break;
        case "report":
            {
                const file = require("./report.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Reporta um usuário\n**Uso: ``" + `${botconfig.prefix}${file.help.name} [@usuário] [motivo]` + "``"));
            }
            break;
        case "renameserver":
            {
                const file = require("./renameserver.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Renomeia o servidor, é possível apenas criar nomes entre 2 a 100 caracteres. |" +
                    " **(apenas para administradores)**\n" +
                    "**Uso: ``" + `${botconfig.prefix}${file.help.name} [novo nome]` + "``**"));
            }
            break;
        case "kick":
            {
                const file = require("./kick.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Expulsa um usuário do servidor | **(apenas para administradores)**\n" +
                    "**Uso:``" + `${botconfig.prefix}${file.help.name} [@usuário] [motivo]` + "``**"));
            }
            break;
        case "ban":
            {
                const file = require("./ban.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Banir usuário | **(apenas para administradores)**\n" +
                    "**Uso:``" + `${botconfig.prefix}${file.help.name} [@usuário] [motivo]` + "``**"));
            }
            break;
        case "tempmute":
            {
                const file = require("./tempmute.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Silenciar um usuário temporariamente | **(apenas para administradores)**\n" +
                    "**Uso:``" + `${botconfig.prefix}${file.help.name} [@usuário] [tempo](s/m/h)` + "``**"));
            }
            break;
        case "desmute":
            {
                const file = require("./desmute.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Desmuta o usuário, apenas utilizável caso o usuário já estiver mutado | **(apenas para administradores)**\n" +
                    "**Uso:``" + `${botconfig.prefix}${file.help.name} [@usuário]` + "``**"));
            }
            break;
        case "mute":
            {
                const file = require("./mute.js")
                return message.channel.send(commands_embed.addField(`${botconfig.prefix}${file.help.name}`,
                    "Silenciar um usuário | **(apenas para administradores)**\n" +
                    "**Uso:``" + `${botconfig.prefix}${file.help.name} [@usuário]` + "``**"));
            }
            break;
        default:
            break;
    }
    return message.channel.send(help_embed);
}

module.exports.help = {
    name: "help"
}