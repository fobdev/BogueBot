const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if (message.author.id === '244270921286811648' && args[0]) {
        let allguilds = bot.guilds.array();
        let guildpoint;
        if (args[0] !== 'list') {
            guildpoint = args[0];
            var server = allguilds[guildpoint];
        } else if (args[0] === 'list') {
            let svlist_str = ``;

            for (let i = 0; i < allguilds.length; i++)
                svlist_str += `[${i}]${allguilds[i].name}\n`;

            return message.channel.send(new Discord.MessageEmbed()
                .setTitle('All guilds by instance number:')
                .setDescription(svlist_str))
        }
    } else server = message.guild;

    let members = server.members.array();
    let online_count = 0;
    for (let i = 0; i < members.length; i++) {
        let member_status = members[i].presence.status;
        if (member_status !== 'offline') online_count++;
    }

    let syschannel = server.systemChannel;
    if (!syschannel) syschannel = 'Indisponível';

    let channels_array = server.channels.array();
    let text_channels = 0;
    let voice_channels = 0;
    for (let i = 0; i < channels_array.length; i++) {
        if (channels_array[i].type === 'text') text_channels++;
        if (channels_array[i].type === 'voice') voice_channels++;
    }

    let membersarray = server.members.array();

    console.log(`\n${server.name} USERS INFORMATION`)
    for (let i = 0; i < membersarray.length; i++) {
        let isadmin = false;
        if (membersarray[i].hasPermission('ADMINISTRATOR')) isadmin = true;

        let log_string = await `[${i + 1}][${membersarray[i].user.tag}] - [id: ${membersarray[i].id}]`;
        if (isadmin) log_string += ' - [admin]';
        console.log(log_string);
    }

    let guild_embed = new Discord.MessageEmbed()
        .setAuthor(`${server.name}`, server.iconURL)
        .setColor("#FF8800")
        .setThumbnail(server.iconURL)
        .addField('ID do servidor', server.id)
        .addField('Dono', `${server.owner.displayName} (${server.owner.user.tag})`, true)
        .addField('ID do dono', server.ownerID, true)
        .addField('Quantidade de membros', server.memberCount, true)
        .addField('Online', online_count, true)
        .addField('Região', server.region, true)
        .addField('Canais', `${text_channels} texto / ${voice_channels} voz`, true)
        .setFooter(`Criado em ${server.createdAt}`, server.owner.user.displayAvatarURL, true)

    if (server === message.guild)
        guild_embed
        .addField('Canal Principal', syschannel, true)
        .addField('Cargos', server.roles.array().join(', '))
    else
        guild_embed
        .addField('Canal Principal', 'Informação indisponível para outros servidores.', true)
        .addField('Cargos', 'Informação indisponível para outros servidores.', true)

    return message.channel.send(guild_embed);
}

module.exports.help = {
    name: 'serverinfo',
    descr: 'Exibe informações sobre o servidor atual.'
}