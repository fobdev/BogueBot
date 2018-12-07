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
                            var channels_sent = 0;
                            var online_total = 0;
                            console.log('\n--------------------------------')
                            for (let i = 0; i < allguilds.length; i++) {

                                // Verify all the members in all guilds
                                var user_inserver = allguilds[i].members.array();
                                for (let j = 0; j < user_inserver.length; j++) {
                                    var is_online = user_inserver[j].presence.status;
                                    if (is_online !== 'offline') {
                                        online_total++;
                                    }
                                }

                                // Verify all the channels in all guilds
                                var allchannels_fromguilds = allguilds[i].channels.array();;
                                for (let j = 0; j < allchannels_fromguilds.length; j++) {

                                    // Filter only text channels
                                    if (allchannels_fromguilds[j].type === 'text') {
                                        allchannels_fromguilds[j].send(user_msgarray[0].content)
                                        channels_sent++;
                                    }

                                    console.log(`GUILD[${i}] SUCESS: [${allguilds[i]}] - Message sent to [${allchannels_fromguilds.length}] text channels.`);
                                    console.log('--------------------------------')
                                }
                                guildsucess++;
                            }

                            message.channel.send(new Discord.RichEmbed()
                                .setTitle('Global Message details')
                                .addField('Online users reached', online_total)
                                .addField('Guilds received', guildsucess)
                                .addField('Text channels received', channels_sent)
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