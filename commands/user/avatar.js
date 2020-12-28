const Discord = require("discord.js");
const validurl = require("valid-url");
const https = require("https");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());
	let argument = args.join(" ");
	let isURLValid = true;
	let gifGuildURL = message.guild.iconURL({
		format: 'gif'
	});
	let gifAuthorURL = message.author.displayAvatarURL({
		format: 'gif'
	});
	let gifUserURL = user_avatar.user.displayAvatarURL({
		format: 'gif'
	});

	// in the case of no mentions
	if (!user_avatar) {
		if (argument === 'server') {
			https.get((gifGuildURL), (res) => {
				if (res.statusCode != 200)
					isURLValid = false;
			})

			let serverEmbed = new Discord.MessageEmbed()
				.setTitle(`Ícone do servidor ${message.guild.name}`)
				.setColor("#00FF00");
			if (isURLValid)
				return message.channel.send(serverEmbed.setImage(gifGuildURL));
			else
				return message.channel.send(serverEmbed.setImage(message.guild.iconURL()));
		} else {
			https.get((gifAuthorURL), (res) => {
				if (res.statusCode != 200)
					isURLValid = false;
			})

			let authorEmbed = new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setColor("#00FF00");
			if (isURLValid)
				message.channel.send(authorEmbed.setImage(gifAuthorURL));
			else
				message.channel.send(authorEmbed.setImage(message.author.displayAvatarURL()));
		}
	}

	https.get((gifUserURL), (res) => {
		if (res.statusCode != 200)
			isURLValid = false;
	})

	let userEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${user_avatar.user.username}**`)
		.setColor("#00FF00");
	if (isURLValid)
		return message.channel.send(userEmbed.setImage(gifUserURL))
	else
		return message.channel.send(userEmbed.setImage(user_avatar.user.displayAvatarURL()))
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}