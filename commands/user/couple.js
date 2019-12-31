const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");
const mergeImg = require('merge-img');
const fs = require('fs');

module.exports.run = async (bot, message, args) => {
    let user1 = message.guild.member(message.mentions.users.firstKey());
    let user2 = message.guild.member(message.mentions.users.lastKey());
    if (!args[0] || (!args[0] && !args[1]) || !args[1] || args.length > 2) {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle('Uso incorreto do comando.')
            .setDescription("Tente usar: ``" + botconfig.prefix + this.help.name + ` [${this.help.arg.join('][')}]` + "``")
            .setColor("#FF0000"));
    }

    let firstmention_id = args[0].slice(0, -1).replace(/[\\<>@#&!]/g, "");
    let filename = `couple_${message.id}.png`;
    if (firstmention_id != user1.user.id) {
        try {
            await mergeImg([user2.user.displayAvatarURL + "?size=8192", user1.user.displayAvatarURL + "?size=8192"]).then((img) => {
                console.log(`Couple image generated sucessfully as [${filename}] locally.`);
                img.write(filename, async () => {
                    // send
                    let attachment = new Discord.Attachment(filename);
                    await message.channel.send(new Discord.RichEmbed()
                        .setTitle(`${user1.displayName} :heart: ${user2.displayName}`)
                        .attachFile(attachment)
                        .setImage(`attachment://${filename}`)
                        .setColor("#00FF00"));
                    // await message.channel.send(new Discord.Attachment(filename));
                    // delete
                    fs.unlink(`./${filename}`, err => {
                        if (err)
                            console.log(`Error in deleting file ${filename}: ${e}`);
                        else return console.log(`File [${filename}] deleted sucessfully.`);
                    })
                })
            });
        } catch (e) {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Erro ao criar o couple.")
                .setDescription("Ocorreu um erro inesperado ao criar o couple, tente de novo mudando a ordem das imagens ou escolhendo outro usuário.")
                .setColor("#FF0000"));
        }
    } else {
        try {
            await mergeImg([user1.user.displayAvatarURL + "?size=8192", user2.user.displayAvatarURL + "?size=8192"]).then((img) => {
                console.log(`Couple image generated sucessfully as [${filename}] locally.`);
                img.write(filename, async () => {
                    // send
                    let attachment = new Discord.Attachment(filename);
                    await message.channel.send(new Discord.RichEmbed()
                        .setTitle(`${user1.displayName} :heart: ${user2.displayName}`)
                        .attachFile(attachment)
                        .setImage(`attachment://${filename}`)
                        .setColor("#00FF00"));
                    //await message.channel.send(new Discord.Attachment(filename))
                    // delete
                    fs.unlink(`./${filename}`, err => {
                        if (err)
                            console.log(`Error in deleting file ${filename}: ${e}`);
                        else return console.log(`File [${filename}] deleted sucessfully.`);
                    })
                })
            });
        } catch (e) {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Erro ao criar o couple.")
                .setDescription("Ocorreu um erro inesperado ao criar o couple, tente de novo mudando a ordem das imagens ou escolhendo outro usuário.")
                .setColor("#FF0000"));
        }
    }
}

module.exports.help = {
    name: "couple",
    descr: 'Junta ordenadamente a imagem de dois usuários.',
    arg: ['membro 1', 'membro 2']
}