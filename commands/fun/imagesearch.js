const Discord = require('discord.js');
const gis = require('g-i-s');

module.exports.run = async (bot, message, args) => {
    let fullmsg = args.join(" ");

    if (!args[0])
        return message.channel.send(new Discord.MessageEmbed()
            .setTitle("Uso incorreto do comando")
            .setDescription(`Digite alguma imagem que queira buscar com >${this.help.name} [${this.help.arg}]`)
            .setColor('#FF0000'));
    else {
        gis(fullmsg, (e, res) => {
            if (e) console.log(e);
            else {
                let answer = new Discord.MessageEmbed()
                    .setTitle(`Resultados para **${fullmsg}** (1/${res.length})`)
                    .setImage(res[0].url)
                    .setColor("#00FF00");

                message.channel.send(answer).then(msg => {
                    msg.react('⬅');
                    msg.react('➡');

                    let reactions = msg.createReactionCollector((reaction, user) => (reaction.emoji.name === '➡' || (reaction.emoji.name === '⬅')) && user.id != bot.user.id, {
                        time: 5 * 60 * 1000 // 5 min cd
                    });

                    let image_index = 0;
                    reactions.on('collect', async r => {

                        // next image
                        if (r.emoji.name == '➡') {
                            image_index++;
                            if (image_index > res.length - 1)
                                image_index = 0;
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(res[image_index].url)
                                .setColor("#00FF00"));
                        }

                        // previous image
                        if (r.emoji.name == '⬅') {
                            image_index--;
                            if (image_index < 0)
                                try {
                                    image_index = res.length - 1;
                                } catch (e) {
                                    image_index++;
                                }
                            await msg.edit(new Discord.MessageEmbed()
                                .setTitle(`Resultados para **${fullmsg}** (${image_index + 1}/${res.length})`)
                                .setImage(res[image_index].url)
                                .setColor("#00FF00"));
                        }

                        msg.reactions.removeAll();
                        msg.react('⬅');
                        msg.react('➡');
                    });

                    reactions.on('end', r => {
                        msg.reactions.removeAll();
                    })
                });
            }
        })
    }
}

module.exports.help = {
    name: 'img',
    descr: 'Faz uma busca no google imagens e entrega a primeira imagem',
    arg: ['busca']
}