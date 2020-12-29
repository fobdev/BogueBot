const Discord = require('discord.js');
const Music = require('../music.js')
const botconfig = require.main.require('./botconfig.json');

module.exports.run = async (bot, message, args, serverQueue) => {
    try {
        function swap(e1, e2, a) {
            var t = a[e1];
            a[e1] = a[e2];
            a[e2] = t;
        }

        if (args[1] === 'shuffle') {
            for (let i = 1; i < serverQueue.songs.length; i++) {
                var rand_pos = Math.floor((Math.random() * i) + 1);
                swap(i, rand_pos, serverQueue.songs);
            }

            return message.channel.send(new Discord.MessageEmbed()
                .setColor('#00FF00')
                .setTitle(`**${message.author.username}** randomizou a fila de **${message.guild.name}**`)
                .setDescription("``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name}` + "`` para ver a fila completa."));
        }

        if (args[1] === 'next' && args[2]) {
            try {
                var swappable = parseInt(args[2]);
            } catch (e) {
                console.error(`${e}: invalid input in 'swap' command.`)
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle('Uso incorreto do comando')
                    .setDescription("``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name} position [numero1]` + "``" +
                        " para colocar [numero1] como próximo video a se reproduzir.")
                    .setColor('#FF0000'));
            }

            if (swappable < 2 || swappable > serverQueue.songs.length) {
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle('Uso incorreto do comando')
                    .setDescription(`Use apenas valores entre **2** e **${serverQueue.songs.length - 1}**`)
                    .setColor("#FF0000"));
            }

            // Puts a copy of the desired video in the beginning of the array at > 0
            serverQueue.songs.splice(1, 0, serverQueue.songs[swappable]);
            // Deletes the original video in the array 
            serverQueue.songs.splice(swappable + 1, 1);

            return message.channel.send(new Discord.MessageEmbed()
                .setDescription(`:arrow_up: **[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})** reproduzindo a seguir.`)
                .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL())
                .setColor("#00FF00"));
        }

        if (args[1] === 'pos' || args[1] === 'position') {
            if (args[2] && args[3]) {
                try {
                    var swappable_e1 = parseInt(args[2]);
                    var swappable_e2 = parseInt(args[3]);
                } catch (e) {
                    console.error(`${e}: invalid input in 'swap' command.`)
                    return message.channel.send(new Discord.MessageEmbed()
                        .setTitle('Uso incorreto do comando')
                        .setDescription("``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name} position [numero1] [numero2]` + "``" +
                            " alterna a posição de dois vídeos na fila.")
                        .setColor('#FF0000'));
                }

                if (serverQueue.songs.length <= 2) return message.channel.send(new Discord.MessageEmbed()
                    .setTitle('Comando inválido')
                    .setDescription('Você precisa de pelo menos 2 músicas para serem alternadas na fila.')
                    .setColor('#FF0000'));

                if (swappable_e1 < 1 ||
                    swappable_e1 > serverQueue.songs.length ||
                    swappable_e2 < 1 ||
                    swappable_e2 > serverQueue.songs.length) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setTitle('Uso incorreto do comando')
                        .setDescription(`Use apenas valores entre **1** e **${serverQueue.songs.length - 1}**`)
                        .setColor("#FF0000"));
                }

                if (swappable_e1 === swappable_e2) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setDescription('Você deve escolher posições diferentes.')
                        .setColor("#FF0000"));
                }


                var first_arrow = '';
                var second_arrow = '';
                if (swappable_e1 < swappable_e2) {
                    first_arrow = ':arrow_up:';
                    second_arrow = ':arrow_down:';
                } else {
                    first_arrow = ':arrow_down:';
                    second_arrow = ':arrow_up:';
                }

                swap(swappable_e1, swappable_e2, serverQueue.songs);
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Posição de vídeos alternadas`)
                    .setDescription(`**${first_arrow} [${serverQueue.songs[swappable_e1].title}](${serverQueue.songs[swappable_e1].url})**\n` +
                        `**${second_arrow} [${serverQueue.songs[swappable_e2].title}](${serverQueue.songs[swappable_e2].url})**`)
                    .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL())
                    .setColor("#00FF00"));

            } else {
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle('Uso incorreto do comando')
                    .setDescription("``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name} position [numero1] [numero2]` + "``" +
                        " alterna a posição de dois vídeos na fila.")
                    .setColor('#FF0000'));
            }
        }

        if (args[1] === 'delete' || args[1] === 'del') {
            if (!args[3]) {
                var entry = parseInt(args[2]);
                if (entry === 0) {
                    await serverQueue.streamdispatcher.end('skipped');
                    return;
                }

                if (!entry) {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setDescription('**Você não especificou o video que quer excluir da fila.**')
                        .setColor("#FF0000"));
                }

                if (entry > 0 && entry <= serverQueue.songs.length) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`**[${serverQueue.songs[entry].title}](${serverQueue.songs[entry].url})**` +
                            ` foi removido da fila.`)
                        .setColor('#00FF00'));

                    await serverQueue.songs.splice(entry, 1);
                    return;
                } else {
                    return message.channel.send(new Discord.MessageEmbed()
                        .setDescription('**Não foram encontrados vídeos na fila com este número**')
                        .setColor('#FF000'));
                }
            } else {
                var start = parseInt(args[2]);
                var end = parseInt(args[3]);
                var amount = start - end;

                if (start > end) return message.channel.send(new Discord.MessageEmbed()
                    .setTitle('O valor **final** deve ser maior que o valor **inicial**.')
                    .setDescription("Dessa vez, tente usar ``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name} del ${end} ${start}` + "``")
                    .setColor('#FF0000'));

                if (amount < 0) amount *= -1;
                if (amount === 0) return message.channel.send(new Discord.MessageEmbed()
                    .setDescription('Os valores precisam ser **diferentes**.')
                    .setColor('#FF0000'));

                if (start > 0 && end <= serverQueue.songs.length) {
                    var deleted_entries = await serverQueue.songs.splice(start, amount + 1);
                    return message.channel.send(new Discord.MessageEmbed()
                        .setDescription(`Foram removidos **${deleted_entries.length}** vídeos da fila de **${message.guild.name}**`)
                        .setColor("#00FF00"));

                } else return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`Você deve colocar valores entre **1** e **${serverQueue.songs.length}**`)
                    .setColor('#FF0000'));
            }
        }

        if (args[1] === 'purge' || args[1] === 'pg') {
            if (!serverQueue)
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription('Não tem nada sendo reproduzido no momento.')
                    .setColor('#FF0000'));

            if (serverQueue.songs.length > 1) {
                await serverQueue.songs.splice(1);
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`A Fila de **${message.guild.name}** foi excluída.`)
                    .setColor("#00FF00"));
            } else {
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`Não tem nada na fila para ser excluído.`)
                    .setColor("#FF0000"));
            }
        }

        if (args[1]) {
            if (parseInt(args[1]) > 1 && parseInt(args[1]) <= serverQueue.songs.length) {
                serverQueue.songs.splice(0, parseInt(args[1] - 1));

                serverQueue.streamdispatcher.end();
                return message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Fila pulada para a posição **${args[1]}**`)
                    .setDescription("``" + `${botconfig.prefix}${Music.help.name} ${module.exports.help.name}` + "`` para ver a nova fila.")
                    .setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL())
                    .setColor("#00FF00"));
            } else {
                return message.channel.send(new Discord.MessageEmbed()
                    .setDescription(`**Use um valor que seja entre 1 e ${serverQueue.songs.length - 1}**`)
                    .setColor("#FF0000"));
            }
        } else {
            var dispatchertime_seconds = Math.floor(serverQueue.streamdispatcher.time / 1000);

            // Tries to print the normal queue
            try {
                var queue_len = 0;
                var ultralarge_queue = '';
                var dispatchertime_seconds = parseInt(Math.floor(serverQueue.streamdispatcher.time / 1000));

                const page_size = 15
                var page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));
                var current_page = 0;

                for (let i = 0; i < serverQueue.songs.length; i++) {
                    queue_len += parseInt(serverQueue.songs[i].length);
                }

                for (let i = 1; i <= page_size; i++) {
                    // Whitespace for padding of numbers
                    var whitespace = ' ';
                    if (i < 10) whitespace = "  ";
                    else whitespace = " ";

                    try {
                        ultralarge_queue += `${i}.${whitespace}${serverQueue.songs[i].title} <${serverQueue.songs[i].author.username}> | < ${Music.util.timing(serverQueue.songs[i].length)} >\n`;
                    } catch (e) {
                        continue;
                    }
                }

                var queue_header = "```md\n" +
                    `Fila de ${message.guild.name}
========================================================================
Agora Tocando: [${serverQueue.songs[0].title}](${Music.util.timing(dispatchertime_seconds)} / ${Music.util.timing(serverQueue.songs[0].length)})

`;;
                var queue_content = `${ultralarge_queue}`;

                var queue_footer = `
Tempo total da fila: [${Music.util.timing(queue_len)}] | [${serverQueue.songs.length}] vídeos.
------------------------------------------------------------------------` + "```";

                var queue_nav_help = "```" + `
Use '<' ou '>' para navegar pelas páginas da fila.` + "```";

                var full_queue = queue_header + queue_content + queue_footer;
                if (serverQueue.songs.length - 1 > page_size) full_queue += queue_nav_help;

                var botmessage_collector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id, {
                    time: 1000 * 60
                });
                var usermessage_navigator = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
                    time: 1000 * 60
                });

                function new_header_f(current_page, page_amount, songs_array) {
                    var page_str = '';
                    if (page_amount > 1) page_str = `| Página ( ${current_page + 1} / ${page_amount} )`
                    var new_header = "```md\n" +
                        `Fila de ${message.guild.name} ${page_str}
========================================================================
Agora Tocando: [${songs_array[0].title}](${Music.util.timing(parseInt(Math.floor(serverQueue.streamdispatcher.time / 1000)))} / ${Music.util.timing(songs_array[0].length)})

`;

                    return new_header;
                }

                function new_content_f(current_page, songs_array) {
                    var new_content = '';
                    for (let i = (page_size * current_page) + 1; i <= (page_size * current_page) + page_size; i++) {
                        // Whitespace for padding of numbers
                        var whitespace = ' ';
                        if (i < 10) whitespace = "  ";
                        else whitespace = " ";

                        /*
                        Try to print the max amount, if the max amount isn't available in the current page
                        print only the available, continue after catch the error
                        */
                        try {
                            new_content += `${i}.${whitespace}${songs_array[i].title} <${songs_array[i].author.username}> | < ${Music.util.timing(songs_array[i].length)} >\n`;
                        } catch (e) {
                            continue;
                        }
                    }
                    return new_content;
                }

                function new_footer_f(song_array, autoupdate_str) {
                    var new_length = 0
                    for (let i = 0; i < song_array.length; i++) {
                        new_length += parseInt(song_array[i].length);
                    }

                    var new_footer = `
Tempo total da fila: [${Music.util.timing(new_length)}] | [${song_array.length}] vídeos | ${autoupdate_str}
------------------------------------------------------------------------` + "```";

                    return new_footer;
                }

                // Update the queue message everytime a bot message is received.
                botmessage_collector.on('collect', bot_msg => {
                    var new_page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));

                    if (new_content_f(current_page, serverQueue.songs).length === 0) current_page = 0;

                    let dynamic_update = new_header_f(current_page, new_page_amount, serverQueue.songs) +
                        new_content_f(current_page, serverQueue.songs) +
                        new_footer_f(serverQueue.songs, 'Autoupdate [ON]');

                    var new_navhelp = "```Interação cancelada, peça uma nova fila para continuar.```";

                    if (usermessage_navigator.ended) {
                        if (page_amount > 1)
                            botmessage_collector.collected.array()[0].edit(dynamic_update + new_navhelp);
                        else
                            botmessage_collector.collected.array()[0].edit(dynamic_update);
                    } else {
                        if (page_amount > 1)
                            botmessage_collector.collected.array()[0].edit(dynamic_update + queue_nav_help);
                        else
                            botmessage_collector.collected.array()[0].edit(dynamic_update);
                    }

                    if (page_amount > 1) {
                        dynamic_update += new_header_f(current_page, new_page_amount, serverQueue.songs) +
                            new_content_f(current_page, serverQueue.songs) +
                            new_footer_f(serverQueue.songs, 'Autoupdate [ON]') + queue_nav_help;
                    } else {
                        dynamic_update += new_header_f(current_page, new_page_amount, serverQueue.songs) +
                            new_content_f(current_page, serverQueue.songs) +
                            new_footer_f(serverQueue.songs, 'Autoupdate [ON]');
                    }

                });

                botmessage_collector.on('end', () => {

                    // Go back to the first page
                    let final_page = new_header_f(0, Math.ceil(((serverQueue.songs.length - 1) / page_size)), serverQueue.songs) +
                        new_content_f(0, serverQueue.songs) +
                        new_footer_f(serverQueue.songs, 'Autoupdate [OFF]') + "```O tempo de navegação da mensagem expirou```";

                    botmessage_collector.collected.array()[0].edit(final_page);
                })


                if (page_amount > 1) {
                    message.channel.send(full_queue);
                    usermessage_navigator.on('collect', async (msg) => {
                        if (msg.content === '>' || msg.content === '<') {
                            var new_page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));

                            try {
                                await msg.delete();
                            } catch (e) {
                                console.error(`${message.guild.name} [queue]: ${e}.`);
                            }

                            if (msg.content === '>') current_page++;
                            if (msg.content === '<') current_page--;
                            if (current_page < 0) current_page = new_page_amount - 1;
                            if (current_page >= new_page_amount) current_page = 0;

                            let new_page = new_header_f(current_page, new_page_amount, serverQueue.songs) +
                                new_content_f(current_page, serverQueue.songs) +
                                new_footer_f(serverQueue.songs, 'Autoupdate [ON]') + queue_nav_help;

                            botmessage_collector.collected.array()[0].edit(new_page);
                        } else {
                            usermessage_navigator.stop('forced');
                        }
                    });

                    usermessage_navigator.on('end', (msg, reason) => {
                        var new_navhelp = '';

                        if (reason === 'forced') {
                            new_navhelp += "```Interação cancelada, peça uma nova fila para continuar.```";
                        } else {
                            new_navhelp += "```O tempo de navegação expirou```";
                        }

                        // Go back to the first page.
                        let final_page = new_header_f(0, Math.ceil(((serverQueue.songs.length - 1) / page_size)), serverQueue.songs) +
                            new_content_f(0, serverQueue.songs) +
                            new_footer_f(serverQueue.songs, 'Autoupdate [ON]') + new_navhelp;

                        botmessage_collector.collected.array()[0].edit(final_page);
                    })
                } else {
                    message.channel.send(full_queue);
                }
                return;
            } catch (e) {
                console.error(e);
                if (e != TypeError) {
                    console.error(e);
                    return message.channel.send(new Discord.MessageEmbed()
                        .setDescription('Não tem filas criadas neste servidor.')
                        .setColor("#FF0000"));
                }

                return console.error(`${e}: Error printing queue list`);
            }
        }
    } catch (e) {
        console.error(`${e} / Queue fatal error.`);
        return message.channel.send(new Discord.MessageEmbed().setTitle('Não tem nada sendo tocado no momento.')
            .setColor("#FF0000"));
    }
}

module.exports.help = {
    name: 'queue',
    name_2: 'q',
    static: false
}