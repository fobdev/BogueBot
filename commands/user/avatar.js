const Discord = require("discord.js");
const https = require("https");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());

	// in the case of no mentions
	if (!user_avatar) {
		if (args.join(' ') === 'server') {
			// shows avatar from the server
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`:frame_photo: Ícone do servidor ${message.guild.name}`)
				.setImage(message.guild.iconURL({
					dynamic: true,
					size: 512
				}))
				.setColor("#FF0000"))
		} else {
			// shows avatar from the message sender
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`:frame_photo: Avatar de ${message.author.username}`)
				.setImage(message.author.displayAvatarURL({
					dynamic: true,
					size: 512
				}))
				.setColor('#00FF00'));
		}
	} else {
		// shows avatar from the actual mentioned person
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle(`:frame_photo: Avatar de ${user_avatar.user.username}`)
			.setImage(user_avatar.user.displayAvatarURL({
				dynamic: true,
				size: 512
			}))
			.setColor('#00FF00'));
	}

	/*
	if (!user_avatar) {
		if (args.join(" ") === 'server') {
			let gifGuildURL = message.guild.iconURL({
				format: 'gif',
				size: 512
			});

			return https.get((gifGuildURL), (res) => {
				if (res.statusCode != 200)
					guildAvatar(message, false, gifGuildURL);
				else guildAvatar(message, true, gifGuildURL);
			})

		} else {
			let gifAuthorURL = message.author.displayAvatarURL({
				format: 'gif',
				size: 512
			});

			return https.get((gifAuthorURL), async (res) => {
				if (res.statusCode != 200)
					authorAvatar(message, false, gifAuthorURL);
				else authorAvatar(message, true, gifAuthorURL);
			})
		}
	}

	let gifUserURL = user_avatar.user.displayAvatarURL({
		format: 'gif',
		size: 512
	});
	return https.get((gifUserURL), (res) => {
		if (res.statusCode != 200)
			userAvatar(message, false, user_avatar, gifUserURL)
		else userAvatar(message, true, user_avatar, gifUserURL);
	})
	 */
}

function userAvatar(message, validURL, uAvatar, gifUserURL) {
	let userEmbed = new Discord.MessageEmbed()
		.setTitle(`:frame_photo: Avatar de **${uAvatar.user.username}**`)
		.setColor("#00FF00");
	if (validURL)
		return message.channel.send(userEmbed.setImage(gifUserURL))
	else
		return message.channel.send(userEmbed.setImage(uAvatar.user.displayAvatarURL({
			size: 512
		})))
}

function guildAvatar(message, validURL, gifGuildURL) {
	let serverEmbed = new Discord.MessageEmbed()
		.setTitle(`:frame_photo: Ícone do servidor ${message.guild.name}`)
		.setColor("#00FF00");

	if (validURL)
		return message.channel.send(serverEmbed.setImage(gifGuildURL));
	else
		return message.channel.send(serverEmbed.setImage(message.guild.iconURL({
			size: 512
		})));
}

function authorAvatar(message, validURL, gifAuthorURL) {
	let authorEmbed = new Discord.MessageEmbed()
		.setTitle(`:frame_photo: Avatar de **${message.author.username}**`)
		.setColor("#00FF00");
	if (validURL)
		return message.channel.send(authorEmbed.setImage(gifAuthorURL));
	else
		return message.channel.send(authorEmbed.setImage(message.author.displayAvatarURL({
			size: 512
		})));

}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}