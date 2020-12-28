const Discord = require("discord.js");
const validurl = require("valid-url");
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
					guildAvatar(false);
				else guildAvatar(true);
			})
		} else {
			let gifAuthorURL = message.author.displayAvatarURL({
				format: 'gif'
			});
			https.get((gifAuthorURL), async (res) => {
				console.log(`statuscode: ${res.statusCode}`)
				if (res.statusCode != 200)
					authorAvatar(false);
				else authorAvatar(true);
			})
		}
	}

	let gifUserURL = user_avatar.user.displayAvatarURL({
		format: 'gif'
	});
	https.get((gifUserURL), (res) => {
		console.log(`statuscode: ${res.statusCode}`)
		if (res.statusCode != 200)
			userAvatar(false, user_avatar)
		else userAvatar(true, user_avatar);
	})
}

function userAvatar(validURL, uAvatar) {
	let userEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${uAvatar.user.username}**`)
		.setColor("#00FF00");
	if (validURL) {
		console.log(`VALIDATED! url: ${gifUserURL}`)
		return message.channel.send(userEmbed.setImage(gifUserURL))
	} else {
		console.log(`NOT VALIDATED! url: ${gifGuildURL}\nSHOULD USE ${uAvatar.user.displayAvatarURL()}`)
		return message.channel.send(userEmbed.setImage(uAvatar.user.displayAvatarURL()))
	}
}

function guildAvatar(validURL) {
	let serverEmbed = new Discord.MessageEmbed()
		.setTitle(`Ícone do servidor ${message.guild.name}`)
		.setColor("#00FF00");

	if (validURL) {
		console.log(`VALIDATED! url: ${gifGuildURL} [isURLValid: ${isURLValid}]`)
		return message.channel.send(serverEmbed.setImage(gifGuildURL));
	} else {
		console.log(`NOT VALIDATED! url: ${gifGuildURL} [isURLValid: ${isURLValid}]\nSHOULD USE: ${message.guild.iconURL()}`)
		return message.channel.send(serverEmbed.setImage(message.guild.iconURL()));
	}
}

function authorAvatar(validURL) {
	let authorEmbed = new Discord.MessageEmbed()
		.setTitle(`Avatar de **${message.author.username}**`)
		.setColor("#00FF00");
	if (validURL) {
		console.log(`VALIDATED! url: ${gifAuthorURL}`)
		return message.channel.send(authorEmbed.setImage(gifAuthorURL));
	} else {
		console.log(`NOT VALIDATED! url: ${gifAuthorURL}\nSHOULD USE: ${message.author.displayAvatarURL()}`)
		return message.channel.send(authorEmbed.setImage(message.author.displayAvatarURL()));
	}
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}