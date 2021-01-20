const Discord = require('discord.js');
const gis = require('g-i-s');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args) => {
    let fullmsg = args.join(" ");

    if (!args[0])
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Uso incorreto do comando")
            .setDescription(`Digite alguma imagem que queira buscar com >${this.help.name} [${this.help.arg}]`)
            .setColor('#FF0000'));
    else {
        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`Buscando por **${fullmsg}**...`)
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
                        msg.react('⬅');

                    if (image_index != res.length - 1)
                        msg.react('➡');

                    let reactions = msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '➡' || (reaction.emoji.name === '⬅')) && user.id != bot.user.id, {
                        time: 5 * 60 * 1000 // 5 min cd
                    });

                    reactions.on('collect', async r => {
                        // next image
                        if (r.emoji.name == '➡') {
                            image_index++;
                            console.log(`url: ${res[image_index].url} | wxh: ${res[image_index].width}x${res[image_index].height}`);
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(await res[image_index].url)
                                .setColor("#00FF00"));
                        }


                        // previous image
                        if (r.emoji.name == '⬅') {
                            image_index--;
                            console.log(`url: ${res[image_index].url} | wxh: ${res[image_index].width}x${res[image_index].height}`);
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(await res[image_index].url)
                                .setColor("#00FF00"));
                        }

                        msg.reactions.removeAll();
                        if (image_index != 0)
                            msg.react('⬅');

                        if (image_index != res.length - 1)
                            msg.react('➡');
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
    descr: 'Faz uma busca no google imagens e entrega a primeira imagem',
    arg: ['busca']
}