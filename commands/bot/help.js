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

let admin_cmdarr = new Array(),
    bot_cmdarr = new Array(),
    user_cmdarr = new Array(),
    fun_cmdarr = new Array();

getcmd_name('admin', admin_cmdarr);
getcmd_name('bot', bot_cmdarr);
getcmd_name('user', user_cmdarr);
getcmd_name('fun', fun_cmdarr);

module.exports.run = async (bot, message, args) => {
    const admin_commands = "[``" + admin_cmdarr.join(', ') + "``]"
    const bot_commands = "[``" + bot_cmdarr.join(', ') + "``]"
    const user_commands = "[``" + user_cmdarr.join(', ') + "``]"
    const fun_commands = "[``" + fun_cmdarr.join(', ') + "``]"

    let help_embed = new Discord.RichEmbed()
        .setAuthor(`Comandos do ${bot.user.username}`, bot.user.displayAvatarURL, "https://github.com/Fobenga")
        .setDescription(`Esses são todos os comandos que eu sei até o momento.\nEstou em constante atualização, então novos comandos poderão surgir em breve.`)
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

    // Function writes the information in the subhelp
    function writefn(array) {
        let foldername = '';
        if (array === bot_cmdarr)
            foldername += 'bot'
        else foldername += args[0];

        /*
        Get the description of the current command in a given category as a map
        that sets as [key : value] -> [command : description]
        */
        let descr_map = new Map();
        let fn_arr = new Array();

        // Reads the commands in runtime
        for (let i = 0; i < array.length; i++) {
            let c_path = require('../' + foldername + '/' + array[i] + '.js');
            fn_arr.push(c_path.help.descr);
            descr_map.set(array[i], fn_arr[i]);
        }

        // Write the map as output in a Discord embed
        let descr_str = '';
        descr_map.forEach((value, key) => {
            let cmd_file = require('../' + foldername + '/' + key + '.js');

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
            return message.channel.send(help_embed);
    }
}

module.exports.help = {
    name: "help",
    name_2: 'h',
    descr: 'Mostra todos os comandos do bot.',
    arg: ['categoria']
}