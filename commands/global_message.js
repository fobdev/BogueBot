const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if (message.author.id === '244270921286811648') {
        var user_collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);

        message.channel.send(`Message Collector created, your next message will be sent to all the servers ${bot.user.username} is in.`);

        user_collector.on('collect', c_msg => {
            var user_msgarray = user_collector.collected.array();

            if (user_msgarray[0].content === 'abort') {
                user_collector.stop('forced')
                return;
            }

            if (!user_msgarray[1]) {
                user_collector.collected.deleteAll();
                message.channel.send(`**Global message generated:**\n\n${user_msgarray[0]}\n\n` +
                    "**Do you want to send it? (y/n)**")
            } else {
                switch (user_msgarray[1].content) {
                    case 'y':
                        {
                            var allguilds = bot.guilds.array();
                            var guildsucess = 0;
                            console.log('\n--------------------------------')
                            for (let i = 0; i < allguilds.length; i++) {
                                const system_channel = allguilds[i].channels.find(ch => ch.id === allguilds[i].systemChannelID);
                                var user_inserver = allguilds[i].members.array();
                                for (let j = 0; j < user_inserver.length; j++) {
                                    var is_online = user_inserver[j].presence.status;
                                    if (is_online !== 'offline') {
                                        online_total++;
                                    }
                                }

                                if (system_channel) {
                                    system_channel.send(user_msgarray[1].content);
                                    guildsucess++;
                                    console.log(`GUILD[${i}] SUCESS: [${allguilds[i]}] - Message sent to System Channel.`);
                                    console.log('--------------------------------')
                                } else {
                                    console.log(`GUILD[${i}] FAIL: [${allguilds[i]}] - No System Channel in guild.`);
                                    console.log('--------------------------------')
                                }
                            }

                            message.channel.send(new Discord.RichEmbed()
                                .setTitle('Global Message details')
                                .addField('Online users reached', online_total)
                                .addField('Guilds sucess', guildsucess)
                                .addField('Guilds fail (no system_channel available)', allguilds.length - guildsucess)
                                .addField('Info', 'For detailed information, see the logs of the bot.')
                                .setColor("#FFFF00"));

                            console.log(`Potentially [${online_total}] members reached in [${guildsucess}] guilds.`);

                            user_collector.stop('sucess');
                        }
                        break;
                    case 'n':
                        user_collector.stop('abort');
                        break;
                    default:
                        user_collector.stop('invalid');
                        break;
                }
            }
        })

        user_collector.on('end', (msg, reason) => {
            switch (reason) {
                case 'sucess':
                    return message.channel.send('Message sent sucessfully.');
                case 'abort':
                    return message.channel.send('Message aborted.');
                case 'invalid':
                    return message.channel.send('Invalid answer, destroying everything.');
                case 'forced':
                    return message.channel.send('Global message creation forced abortion.');
                default:
                    return message.channel.send('Logic error, please analyse code.');
            }
        })
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setDescription("**Você não tem permissão para usar este comando.**")
            .setColor('#FF0000'));
    }
}

module.exports.help = {
    name: 'global-message'
}