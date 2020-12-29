const Discord = require("discord.js");
const https = require("https");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());

	// in the case of no mentions
	if (!user_avatar) {
		if (args.join(" ") === 'server') {
			let gifGuildURL = message.guild.iconURL({
				format: 'gif'
			});

			https.get((gifGuildURL), (res) => {
				console.log(`statuscode: ${res.statusCode}`);
				if (res.statusCode != 200)
					return guildAvatar(message, false, gifGuildURL);
				else return guildAvatar(message, true, gifGuildURL);
			})
		} else {
			https.get((gifAuthorURL), async (res) => {
				let gifAuthorURL = message.author.displayAvatarURL({
					format: 'gif'
				});

				console.log(`statuscode: ${res.statusCode}`)
				if (res.statusCode != 200)
					return authorAvatar(message, false, gifAuthorURL);
				else return authorAvatar(message, true, gifAuthorURL);
			})
		}
	}

	https.get((gifUserURL), (res) => {
		let gifUserURL = uAvatar.user.displayAvatarURL({
			format: 'gif'
		});

		console.log(`statuscode: ${res.statusCode}`)
		if (res.statusCode != 200)
			return userAvatar(message, false, user_avatar, gifUserURL)
		else return userAvatar(message, true, user_avatar, gifUserURL);
	})
}

function userAvatar(message, validURL, uAvatar, gifUserURL) {
	let userEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${uAvatar.user.username}**`)
		.setColor("#00FF00");
	if (validURL) {
		return message.channel.send(userEmbed.setImage(gifUserURL))
	} else {
		return message.channel.send(userEmbed.setImage(uAvatar.user.displayAvatarURL()))
	}
}

function guildAvatar(message, validURL, gifGuildURL) {
	let serverEmbed = new Discord.MessageEmbed()
		.setTitle(`Ícone do servidor ${message.guild.name}`)
		.setColor("#00FF00");

	if (validURL) {
		return message.channel.send(serverEmbed.setImage(gifGuildURL));
	} else {
		return message.channel.send(serverEmbed.setImage(message.guild.iconURL()));
	}
}

function authorAvatar(message, validURL, gifAuthorURL) {
	let authorEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${message.author.username}**`)
		.setColor("#00FF00");
	if (validURL) {
		return message.channel.send(authorEmbed.setImage(gifAuthorURL));
	} else {
		return message.channel.send(authorEmbed.setImage(message.author.displayAvatarURL()));
	}
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}