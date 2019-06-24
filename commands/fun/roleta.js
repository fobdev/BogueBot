const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if (message.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
        let validMembers = 0;
        let adminMembers = 0;
        let membersArray = message.guild.members.array();

        // Members validation
        for (let i = 0; i < membersArray.length; i++) {
            if (!membersArray[i].hasPermission('ADMINISTRATOR')) {
                validMembers++;
            } else adminMembers++;
        }

        // Inconsistency checking
        if (adminMembers == membersArray.length)
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Todos os membros são administradores.')
                .setDescription(`Roleta russa apenas rolará para membros que não são administradores.
                Tente adicionar novos usuários ou tirar o administrador de usuários presentes.`)
                .setColor('#FF0000'));
        else if ((membersArray.length - adminMembers) == 1) {
            return message.channel.send(new Discord.RichEmbed()
                .setTitle('Lista de membros insuficiente.')
                .setDescription(`A lista de membros **que não são administradores** é insuficiente para começar uma roleta russa.
                Tente adicionar novos usuários ou tirar o administrador de usuários presentes.`)
                .setColor("#FF0000"));
        }

        let admin_plural = 'administrador não entrou na roleta.';
        if (adminMembers > 1) admin_plural = 'administradores não entraram na roleta.'
        message.channel.send(new Discord.RichEmbed()
            .setTitle(`Roleta Russa de membros do servidor ${message.guild.name}`)
            .setDescription(`Rolando para **${validMembers}** membros...\n
            ${adminMembers} ${admin_plural}`)
            .setColor('#00FF00'));

        setTimeout(() => {
            // Roulette
            let rng = Math.ceil(Math.random() * (membersArray.length - adminMembers + 1));

            // Forces a non-admin entry
            while (membersArray[rng].hasPermission('ADMINISTRATOR'))
                rng = Math.ceil(Math.random() * (membersArray.length - adminMembers + 1));

            message.channel.send(new Discord.RichEmbed()
                .setTitle('Membro expulso do servidor.')
                .setDescription(`${membersArray[rng]} foi removido do servidor na roleta russa.`)
                .setColor('#FF9102')
                .setThumbnail(membersArray[rng].displayAvatarURL));
            message.channel.send("rng: " + rng);
            return membersArray[rng].kick();
        }, 3000)
    } else {
        return message.channel.send(new Discord.RichEmbed()
            .setTitle('Apenas administradores podem rodar a roleta russa.')
            .setColor('#FF0000'));
    }
}

module.exports.help = {
    name: 'roleta',
    descr: 'Roda a roleta russa e expulsa um usuário não-administrador do servidor.'
}