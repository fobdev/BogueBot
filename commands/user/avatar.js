const Discord = require("discord.js");
const validurl = require("valid-url");
const https = require("https");

module.exports.run = (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());
	let argument = args.join(" ");
	let isURLValid = true;

	// in the case of no mentions
	if (!user_avatar) {
		if (argument === 'server') {
			let gifGuildURL = message.guild.iconURL({
				format: 'gif'
			}); {
				https.get((gifGuildURL), (res) => {
					console.log(`statuscode: ${res.statusCode}`);
					if (res.statusCode != 200)
						isURLValid = false;
				})
			}

			let serverEmbed = new Discord.MessageEmbed()
				.setTitle(`Ícone do servidor ${message.guild.name}`)
				.setColor("#00FF00");

			if (isURLValid) {
				console.log(`VALIDATED! url: ${gifGuildURL} [isURLValid: ${isURLValid}]`)
				return message.channel.send(serverEmbed.setImage(gifGuildURL));

			} else {
				console.log(`NOT VALIDATED! url: ${gifGuildURL} [isURLValid: ${isURLValid}]\nSHOULD USE: ${message.guild.iconURL()}`)
				return message.channel.send(serverEmbed.setImage(message.guild.iconURL()));
			}
		} else {
			let gifAuthorURL = message.author.displayAvatarURL({
				format: 'gif'
			}); {
				https.get((gifAuthorURL), async (res) => {
					console.log(`statuscode: ${res.statusCode}`)
					if (res.statusCode != 200)
						isURLValid = false;
				})
			}

			let authorEmbed = new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setColor("#00FF00");
			if (isURLValid) {
				console.log(`VALIDATED! url: ${gifAuthorURL}`)
				return message.channel.send(authorEmbed.setImage(gifAuthorURL));
			} else {
				console.log(`NOT VALIDATED! url: ${gifAuthorURL}\nSHOULD USE: ${message.author.displayAvatarURL()}`)
				return message.channel.send(authorEmbed.setImage(message.author.displayAvatarURL()));
			}
		}
	}

	let gifUserURL = user_avatar.user.displayAvatarURL({
		format: 'gif'
	}); {
		https.get((gifUserURL), (res) => {
			console.log(`statuscode: ${res.statusCode}`)
			if (res.statusCode != 200)
				isURLValid = false;
		})
	}

	let userEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${user_avatar.user.username}**`)
		.setColor("#00FF00");
	if (isURLValid) {
		console.log(`VALIDATED! url: ${gifUserURL}`)
		return message.channel.send(userEmbed.setImage(gifUserURL))
	} else {
		console.log(`NOT VALIDATED! url: ${gifGuildURL}\nSHOULD USE ${user_avatar.user.displayAvatarURL()}`)
		return message.channel.send(userEmbed.setImage(user_avatar.user.displayAvatarURL()))
	}
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}