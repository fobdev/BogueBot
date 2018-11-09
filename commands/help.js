const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports.run = async (bot, message, args) => {

    const utility_commands =
        "|``" + `${botconfig.prefix}` + "invite           ``|" + "`` - `` **Mostra o link para convidar o " + `${bot.user.username}` + " para qualquer servidor.\n**" +
        "|``" + `${botconfig.prefix}` + "help             ``|" + "`` - `` **Todos os comandos disponíveis.**\n" +
        "|``" + `${botconfig.prefix}` + "help music       ``|" + "`` - `` **Todos os comandos de música disponíveis.**\n" +
        "|``" + `${botconfig.prefix}` + "uptime           ``|" + "`` - `` **Mostra o tempo que o bot está online desde a ultima atualização.**\n";
        

    const authority_commands =
        "|``" + `${botconfig.prefix}` + "mute [membro]             ``|" + "`` - `` **Muta um membro do servidor.\n                **" +
        "|``" + `${botconfig.prefix}` + "desmute [membro]          ``|" + "`` - `` **Desmuta um membro já mutado no servidor.\n   **" +
        "|``" + `${botconfig.prefix}` + "tempmute [membro] [tempo] ``|" + "`` - `` **Muta temporariamente um usuário.\n           **" +
        "|``" + `${botconfig.prefix}` + "kick [membro] [motivo]    ``|" + "`` - `` **Expulsa um membro do servidor.\n             **" +
        "|``" + `${botconfig.prefix}` + "ban [membro] [motivo]     ``|" + "`` - `` **Bane um membro do servidor.\n                **" +
        "|``" + `${botconfig.prefix}` + "report [membro] [motivo]  ``|" + "`` - `` **Denuncia um membro do servidor.\n            **" +
        "|``" + `${botconfig.prefix}` + "renameserver [novo nome]  ``|" + "`` - `` **Renomeia o servidor.\n                       **" +
        "|``" + `${botconfig.prefix}` + "clear [numero]            ``|" + "`` - `` **Apaga uma certa quantidade de mensagens.     **";



    const user_commands =
        "|``" + `${botconfig.prefix}` + "avatar [membro]    ``|" + "`` - `` **Exibe em tamanho grande o avatar de um membro.**";

    const fun_commands =
        "|``" + `${botconfig.prefix}` + "lenny              ``|";


    const music_file = require("./music.js");
    const musicprefix = `${botconfig.prefix}${music_file.help.name}`;

    const music_commands =
        "[``" + `${musicprefix}` + " [search]           ``] " + "`` - `` **Toca um vídeo do YouTube / adiciona à fila.\n              **" +
        "[``" + `${musicprefix}` + " queue              ``] " + "``" + ` ou [${musicprefix}` + " q    ``]" + "`` - `` **Para visualizar toda a fila.\n   **" +
        "[``" + `${musicprefix}` + " queue [numero]     ``] " + "`` - `` **Para pular para uma certa posição da fila.\n   **" +
        "[``" + `${musicprefix}` + " queue purge        ``] " + "`` - `` **Remove todos os itens da fila.\n   **" +
        "[``" + `${musicprefix}` + " np                 ``] " + "`` - `` **Exibe o que está sendo tocado no momento.\n   **" +
        "[``" + `${musicprefix}` + " skip               ``] " + "``" + ` ou [${musicprefix}` + " s    ``]" + "`` - `` **Pula para o próximo video da fila.\n   **" +
        "[``" + `${musicprefix}` + " leave              ``] " + "``" + ` ou [${musicprefix}` + " l    ``]" + "`` - `` **Sai do canal de voz e apaga a fila.    **\n" +
        "[``" + `${musicprefix}` + " p                  ``] " + "`` - `` **Pausa/despausa a reprodução atual\n**" +
        "[``" + `${musicprefix}` + " earrape            ``] " + "`` - `` **Aumenta extremamente o volume fazendo a reprodução ficar inaudível.\n**";


    let help_embed = new Discord.RichEmbed()
        .setTitle(`**${bot.user.username} Ajuda**`)
        .setDescription(`Estes são todos os comandos disponíveis do ${bot.user.username} até o momento.\n` +
            "Note que o Bot está em constante manutenção para testes e implementações de novas funções.\n" +
            "Bot desenvolvido por [Fobenga](https://github.com/pedroxvi), de código aberto disponível em seu [GitHub](https://github.com/pedroxvi/BogueBot).\n" +
            "Use o prefixo ``" + `${botconfig.prefix}` + "`` para executar os comandos abaixo.\n" +
            "Você também pode usar ``" + `${botconfig.prefix}${this.help.name}` + " [categoria]`` para a ajuda de uma categoria específica da lista.")
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL)
        .setTimestamp(bot.user.createdAt)
        .setURL("https://github.com/pedroxvi")
        .setFooter("Fobenga, criado em ")
        .setColor("#00FF00")
        .addField('\u200B', "**__UTIL__**\n" + utility_commands)
        .addField('\u200B', "**__MUSIC__**\n" + music_commands)
        .addField('\u200B', "**__ADMIN__**\n" + authority_commands)
        .addField('\u200B', "**__USER__**\n" + user_commands)
        .addField('\u200B', "**__FUN__**\n" + fun_commands);


    let helpcommand = args.join(" ");
    let subhelp_embed = new Discord.RichEmbed()
        .setColor("#00FF00")
        .setFooter('Fobenga, criado em ')
        .setTimestamp(bot.user.createdAt);

    switch (helpcommand) {
        case 'music':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`${bot.user.username} Comandos do Music Player`)
                    .setDescription(music_commands));
            }
        case 'admin':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`${bot.user.username} Comandos administrativos`)
                    .setDescription(authority_commands));
            }
        case 'util':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`${bot.user.username} Comandos Úteis`)
                    .setDescription(utility_commands));
            }
        case 'user':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`${bot.user.username} Comandos de usuário`)
                    .setDescription(user_commands));
            }
        default:
            break;
    }

    return message.channel.send(help_embed);
}

module.exports.help = {
    name: "help"
}
