const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	let sv_icon = args.join(" ");

	if (!user_avatar) {
		if (sv_icon === 'server') {
			message.channel.send("d:" + message.guild.iconURL);

			if (message.guild.iconURL.includes(".webp")) {
				return message.channel.send(message.guild.iconURL.replace(".webp", ".gif"));
			} else {
				return message.channel.send(new Discord.RichEmbed()
					.setTitle(`Ícone do servidor ${message.guild.name}`)
					.setImage(message.guild.iconURL)
					.setColor("#00FF00"));
			}
		}

		if (message.author.displayAvatarURL.endsWith(".gif")) {
			return message.channel.send(message.author.displayAvatarURL);
		} else {
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setImage(message.author.displayAvatarURL)
				.setColor("#00FF00"));
		}
	}

	if (user_avatar.user.displayAvatarURL.endsWith(".gif")) {
		return message.channel.send(user_avatar.user.displayAvatarURL);
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