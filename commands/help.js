const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    const music_commands_small =
        "[``(m)usic                    ``]";

    const new_music_commands = "```css\n" +
        `[Comandos de música do ${bot.user.username}]
	
>music [música].........................Toca um vídeo do YouTube / adiciona à fila.
>music (q)ueue..........................Exibe toda a fila do servidor.
       (q)ueue [numero].................Pula para uma certa posição da fila.
       (q)ueue next [numero]............Coloca o vídeo selecionado como próximo a tocar.
	   (q)ueue pos [numero1] [numero2]..Alterna a posição entre dois vídeos na fila.
       (q)ueue shuffle..................Randomiza a fila.
       (q)ueue (del)ete [numero]........Exclui um certo item da fila.
       (q)ueue purge(pg)................Limpa todos os itens da fila.
	   
>music np.........Mostra informações sobre o que está sendo tocado.
>music (s)kip.....Pula a reprodução atual.
>music p..........Pausa ou despausa a reprodução atual.
>music (l)eave....Sai do canal de voz e exclui a fila atual.
>music earrape....Aumenta extremamente o volume da reprodução atual.

Você pode substituir '>music' por '>m', '>play' ou '>p'.` +
        "```";

    const authority_commands_small =
        "[``mute                ``, " +
        "`` desmute             ``, " +
        "`` tempmute            ``, " +
        "`` kick                ``, " +
        "`` ban                 ``, " +
        "`` report              ``, " +
        "`` renameserver (rs)   ``, " +
        "`` clear               ``]";

    const authority_commands =
        "|``" + `${botconfig.prefix}` + "mute [membro]             ``|" + "`` - `` **Muta um membro do servidor.\n                **" +
        "|``" + `${botconfig.prefix}` + "desmute [membro]          ``|" + "`` - `` **Desmuta um membro já mutado no servidor.\n   **" +
        "|``" + `${botconfig.prefix}` + "tempmute [membro] [tempo] ``|" + "`` - `` **Muta temporariamente um usuário.\n           **" +
        "|``" + `${botconfig.prefix}` + "kick [membro] [motivo]    ``|" + "`` - `` **Expulsa um membro do servidor.\n             **" +
        "|``" + `${botconfig.prefix}` + "ban [membro] [motivo]     ``|" + "`` - `` **Bane um membro do servidor.\n                **" +
        "|``" + `${botconfig.prefix}` + "report [membro] [motivo]  ``|" + "`` - `` **Denuncia um membro do servidor.\n            **" +
        "|``" + `${botconfig.prefix}` + "renameserver [novo nome]  ``|" + "`` - `` **Renomeia o servidor.\n                       **" +
        "|``" + `${botconfig.prefix}` + "rs [novo nome]            ``|                                                             \n" +
        "|``" + `${botconfig.prefix}` + "clear [numero]            ``|" + "`` - `` **Apaga uma certa quantidade de mensagens.     **";

    const boguebot_commands_small =
        "[``invite          ``, " +
        "``help             ``, " +
        "``serverinfo       ``, " +
        "``uptime           ``]";

    const boguebot_commands =
        "|``" + `${botconfig.prefix}` + "invite           ``|" + "`` - `` **Mostra o link para convidar o " + `${bot.user.username}` + " para qualquer servidor.\n**" +
        "|``" + `${botconfig.prefix}` + "help             ``|" + "`` - `` **Todos os comandos disponíveis.**\n" +
        "|``" + `${botconfig.prefix}` + "serverinfo       ``|" + "`` - `` **Exibe todas as informações do servidor.**\n" +
        "|``" + `${botconfig.prefix}` + "uptime           ``|" + "`` - `` **Mostra o tempo que o bot está online desde a ultima atualização.**\n";

    const user_commands_small =
        "[``avatar    ``]";

    const user_commands =
        "|``" + `${botconfig.prefix}` + "avatar [membro]    ``|" + "`` - `` **Exibe em tamanho grande o avatar de um membro.**";

    const fun_commands_small =
        "[``dice                ``, " +
        "``flipcoin             ``, " +
        "``lenny                ``, " +
        "``copycat              ``]";

    const fun_commands =
        "|``" + `${botconfig.prefix}` + "dice [dados]       ``| " + "`` - `` **Role 1 ou mais dados para cima e veja o resultado.\n**" +
        "|``" + `${botconfig.prefix}` + "flipcoin           ``| " + "`` - `` **Jogue uma moeda para cima.\n**" +
        "|``" + `${botconfig.prefix}` + "lenny              ``| " + "`` - `` **Lenny face.\n**" +
        "|``" + `${botconfig.prefix}` + "copycat            ``| " + "`` - `` **O comando mais irritante de todos.**";

    let help_embed = new Discord.RichEmbed()
        .setDescription(`Esses são todos os comandos que eu sei até o momento.\nEstou em constante atualização, então novos comandos poderão surgir em breve.`)
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL, "https://github.com/Fobenga")
        .setTimestamp(bot.user.createdAt)
        .setURL("https://github.com/pedroxvi")
        .setFooter("Fobenga, criado em ", 'https://images-ext-1.discordapp.net/external/HRRbNejI4Jdna8UcivhiBDfEj382i4-yPwkArneYpLU/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/244270921286811648/09318e9b9103e6806fa74258f414394c.png')
        .setColor("#00FF00")
        .addField("MUSIC", music_commands_small)
        .addField(bot.user.username.toUpperCase(), boguebot_commands_small)
        .addField("ADMIN", authority_commands_small)
        .addField("USER", user_commands_small)
        .addField("FUN", fun_commands_small)
        .addField('\u200B', "**Use ``" + `${botconfig.prefix}${this.help.name} [categoria]` + "`` para informação detalhada sobre uma categoria**")
        .addField('Exemplos', "``" + `${botconfig.prefix}${this.help.name} music` + "`` exibe todos os comandos de música");

    let helpcommand = args.join(" ");
    let subhelp_embed = new Discord.RichEmbed()
        .setColor("#00FF00")
        .setFooter('Fobenga, criado em ')
        .setTimestamp(bot.user.createdAt);

    switch (helpcommand) {
        case 'music':
            {
                return message.channel.send(new_music_commands);
            }
        case 'admin':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`Comandos Administrativos`)
                    .setDescription(authority_commands));
            }
        case `${bot.user.username.toLowerCase()}`:
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`${bot.user.username}`)
                    .setDescription(boguebot_commands));
            }
        case 'user':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`Comandos de Usuário`)
                    .setDescription(user_commands));
            }
        case 'fun':
            {
                return message.channel.send(subhelp_embed
                    .setTitle(`Aleatórios`)
                    .setDescription(fun_commands));
            }
        default:
            break;
    }

    return message.channel.send(help_embed);
}

module.exports.help = {
    name: "help",
    name_2: 'h',
}