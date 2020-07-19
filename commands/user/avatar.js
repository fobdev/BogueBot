const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	let sv_icon = args.join(" ");

	if (!user_avatar) {
		if (sv_icon === 'server') {
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(`Ícone do servidor ${message.guild.name}`)
				.setImage(message.guild.iconURL)
				.setColor("#00FF00"));
		}


		if (message.author.displayAvatarURL.endsWith(".gif")) {
			return message.channel.send(`Avatar de **${message.author}**\n` + message.author.displayAvatarURL)
		} else {
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setImage(message.author.displayAvatarURL)
				.setColor("#00FF00"));
		}
	}

	if (user_avatar.user.displayAvatarURL.endsWith(".gif")) {
		return message.channel.send(`Avatar de **${user_avatar.user}**\n` + user_avatar.user.displayAvatarURL)
	} else {
		return message.channel.send(new Discord.RichEmbed()
			.setTitle(`Avatar de **${user_avatar.user.username}**`)
			.setImage(user_avatar.user.displayAvatarURL)
			.setColor("#00FF00"));
	}
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}