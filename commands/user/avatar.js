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
				.setColor("#00FF00"))
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
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}