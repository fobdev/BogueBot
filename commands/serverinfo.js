const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    var server = message.guild;

    var members = server.members.array();
    let online_count = 0;
    for (let i = 0; i < members.length; i++) {
        var member_status = members[i].presence.status;
        if (member_status !== 'offline') online_count++;
    }

    var syschannel = server.systemChannel;
    if (!syschannel) syschannel = 'Indisponível';

    var channels_array = server.channels.array();
    let text_channels = 0;
    let voice_channels = 0;
    for (let i = 0; i < channels_array.length; i++) {
        if (channels_array[i].type === 'text') text_channels++;
        if (channels_array[i].type === 'voice') voice_channels++;
    }

    return message.channel.send(new Discord.RichEmbed()
        .setAuthor(`${server.name}`, server.iconURL)
        .setColor("#FF8800")
        .setThumbnail(server.iconURL)
        .addField('ID', server.id, true)
        .addField('Dono', `<@${server.ownerID}>`, true)
        .addField('Quantidade de membros', server.memberCount, true)
        .addField('Online', online_count, true)
        .addField('Região', server.region, true)
        .addField('Canal Principal', syschannel, true)
        .addField('Canais', `${text_channels} texto / ${voice_channels} voz`, true)
        .addField('Cargos', server.roles.array().join(', '))
        .setFooter(`Criado em ${server.createdAt}`, server.iconURL, true)
    )
}

module.exports.help = {
    name: 'serverinfo'
}