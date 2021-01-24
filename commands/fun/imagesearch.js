const Discord = require('discord.js');
const gis = require('g-i-s');
const fetch = require('node-fetch');
const botconfig = require('../../botconfig.json');

module.exports.run = async (bot, message, args) => {
    let fullmsg = args.join(" ");

    if (!args[0])
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Uso incorreto do comando")
            .setDescription("Digite sua busca com `" + `${botconfig.prefix}${this.help.name_3} [${this.help.arg}]` + "`")
            .addField('Você também pode usar:', "`" + `${botconfig.prefix}${this.help.name} [${this.help.arg}]` + "`\n`" + `${botconfig.prefix}${this.help.name_2} [${this.help.arg}]` + "`")
            .setColor('#FF0000'));
    else {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Buscando por **${fullmsg}**...`)
            .setDescription("Você também pode usar `" + `${botconfig.prefix}${this.help.name}` + "` e `" + `${botconfig.prefix}${this.help.name_2}` + "` para buscar")
            .setColor("#00FF00")).then(async msg => {
            gis(fullmsg, async (e, unfiltered) => {
                if (e) console.log(e);
                else if (unfiltered.length < 2) {
                    return msg.edit(new Discord.MessageEmbed()
                        .setTitle('Erro na busca')
                        .setDescription('Não foi encontrado nenhum resultado para sua busca.')
                        .setColor('#FF0000'));
                } else {
                    let image_index = 0;
                    let res = [];

                    function errorHandler(response) {
                        if (!response.ok)
                            throw Error(response.statusText);
                        return response;
                    }

                    // load only the first result
                    for (let i = 0; i < unfiltered.length; i++) {
                        let valid = false;
                        await fetch(unfiltered[i].url).then(errorHandler).then(response => {
                            if (response.status == 200) {
                                valid = true;
                                res.push(unfiltered[i]);
                            }
                        }).catch(error => null)
                        if (valid) break;
                    }

                    // compute other results
                    for (let i = 0; i < unfiltered.length; i++) {
                        fetch(unfiltered[i].url).then(errorHandler).then(response => {
                            if (response.status == 200 && unfiltered[i].url != res[0].url)
                                res.push(unfiltered[i]);
                        }).catch(error => null)
                    }

                    await msg.edit(new Discord.MessageEmbed()
                        .setTitle(`Resultados para **${fullmsg}**`)
                        .setImage(res[image_index].url)
                        .setColor("#00FF00"));

                    if (image_index != 0)
                        await msg.react('⬅');

                    if (image_index != res.length - 1)
                        await msg.react('➡');

                    let reactions = msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '➡' || (reaction.emoji.name === '⬅')) && user.id != bot.user.id, {
                        time: 3 * 60 * 1000 // 3 min inactivity
                    });

                    reactions.on('collect', async r => {
                        // next image
                        if (r.emoji.name == '➡') {
                            image_index++;
                            reactions.resetTimer();
                            // console.log(`url: ${res[image_index].url} | wxh: ${res[image_index].width}x${res[image_index].height}`);
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(await res[image_index].url)
                                .setColor("#00FF00"));
                        }

                        // previous image
                        if (r.emoji.name == '⬅') {
                            image_index--;
                            reactions.resetTimer();
                            // console.log(`url: ${res[image_index].url} | wxh: ${res[image_index].width}x${res[image_index].height}`);
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(await res[image_index].url)
                                .setColor("#00FF00"));
                        }

                        msg.reactions.removeAll();

                        if (image_index != 0)
                            await msg.react('⬅');

                        if (image_index != res.length - 1)
                            await msg.react('➡');
                    });

                    reactions.on('end', r => {
                        msg.reactions.removeAll();
                    })

                }
            })
        })
    }
}

module.exports.help = {
    name: 'image',
    name_2: 'img',
    name_3: 'imagesearch',
    descr: 'Realiza uma busca de imagens e gifs.',
    arg: ['busca']
}