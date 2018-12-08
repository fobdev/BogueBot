const Discord = require("discord.js");
const botconfig = require("../../botconfig.json");
const fs = require("fs");

function getcmd_name(foldername, array) {
    let path = './commands/' + foldername + '/';
    let ignore = 'global_message.js';

    fs.readdir(path, (e, files) => {
        if (e)
            console.error(`\nPath '${path}' does not exists.\n`);

        var jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length < 1)
            throw new Error("Could not find commands.")

        jsfile.forEach(f => {
            if (f != ignore)
                // removes the .js from file name and push full file name into array
                array.push(f.slice(0, f.length - 3));
        })
    })
}

let admin_cmdarr = new Array();
let bot_cmdarr = new Array();
let user_cmdarr = new Array();
let fun_cmdarr = new Array();
getcmd_name('admin', admin_cmdarr);
getcmd_name('bot', bot_cmdarr);
getcmd_name('user', user_cmdarr);
getcmd_name('fun', fun_cmdarr);

function getcmd_descr(foldername, array) {
    let descr_map = new Map();
    let fn_arr = new Array();

    for (let i = 0; i < array.length; i++) {
        let c_path = require('../' + foldername + '/' + array[i] + '.js');
        fn_arr.push(c_path.help.descr);
        descr_map.set(array[i], fn_arr[i]);
    }

    return descr_map;
}

module.exports.run = async (bot, message, args) => {
    const admin_commands = "[``" + admin_cmdarr.join(', ') + "``]"
    const bot_commands = "[``" + bot_cmdarr.join(', ') + "``]"
    const user_commands = "[``" + user_cmdarr.join(', ') + "``]"
    const fun_commands = "[``" + fun_cmdarr.join(', ') + "``]"

    let help_embed = new Discord.RichEmbed()
        .setDescription(`Esses são todos os comandos que eu sei até o momento.\nEstou em constante atualização, então novos comandos poderão surgir em breve.`)
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL, "https://github.com/Fobenga")
        .setURL("https://github.com/Fobenga")
        .setFooter("Desenvolvido por Fobenga em ", 'https://images-ext-1.discordapp.net/external/HRRbNejI4Jdna8UcivhiBDfEj382i4-yPwkArneYpLU/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/244270921286811648/09318e9b9103e6806fa74258f414394c.png')
        .setTimestamp(bot.user.createdAt)
        .setColor("#00FF00")
        .addField("MUSIC", "[``music``]")
        .addField(bot.user.username.toUpperCase(), bot_commands)
        .addField("ADMIN", admin_commands)
        .addField("USER", user_commands)
        .addField("FUN", fun_commands)
        .addField('\u200B', "**Use ``" + `${botconfig.prefix}${this.help.name} [categoria]` + "`` para ajuda sobre determinada categoria**")
        .addField('Exemplos', "``" + `${botconfig.prefix}${this.help.name} music` + "`` exibe todos os comandos de música");

    function writefn(array) {
        let titlename = '';
        if (array === bot_cmdarr)
            titlename += 'bot'
        else titlename += args[0];

        let cur_cmd = getcmd_descr(titlename, array);

        let descr_str = '';
        cur_cmd.forEach((value, key) => {
            let cmd_file = require('../' + titlename + '/' + key + '.js');

            if (cmd_file.help.arg) {
                descr_str += "``" + `${botconfig.prefix}${key} [${cmd_file.help.arg.join('] [')}]` + "`` " + `${value}\n`;
            } else {
                descr_str += "``" + `${botconfig.prefix}${key}` + "`` " + `${value}\n`;
            }

        })

        message.channel.send(new Discord.RichEmbed()
            .setTitle(args[0].toUpperCase() + ' Commands')
            .setDescription(`**${descr_str}**`)
            .setColor('#00FF00'));
    }

    switch (args[0]) {
        case 'music':
            {
                return message.channel.send("```css\n" +
                    `[Comandos de música do ${bot.user.username}]
	
>music [música]...........................Toca um vídeo do YouTube / adiciona à fila.
>music (q)ueue............................Exibe toda a fila do servidor.
       (q)ueue [num]......................Pula para uma certa posição da fila.
       (q)ueue next [num].................Coloca um item da fila como próximo a tocar.
	   (q)ueue pos [num1] [num2]..........Alterna a posição entre dois itens na fila.
       (q)ueue shuffle....................Randomiza a fila.
       (q)ueue (del)ete [num].............Exclui um certo item da fila.
       (q)ueue (del)ete [inicio] [fim]....Exclui os itens entre [inicio] e [fim].
       (q)ueue purge(pg)..................Limpa todos os itens da fila.
	   
>music np.........Mostra informações sobre o que está sendo tocado.
>music (s)kip.....Pula a reprodução atual.
>music p..........Pausa ou despausa a reprodução atual.
>music (l)eave....Sai do canal de voz e exclui a fila atual.
>music earrape....Aumenta extremamente o volume da reprodução atual.

Você pode substituir '>music' por '>m', '>play' ou '>p'.` +
                    "```");
            }
        case `${bot.user.username.toLowerCase()}`:
            return writefn(bot_cmdarr);
        case 'user':
            return writefn(user_cmdarr);
        case 'fun':
            return writefn(fun_cmdarr);
        case 'admin':
            return writefn(admin_cmdarr);
        default:
            break;
    }

    return message.channel.send(help_embed);
}

module.exports.help = {
    name: "help",
    name_2: 'h',
    descr: 'Mostra todos os comandos do bot.',
    arg: ['categoria']
}