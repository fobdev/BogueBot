const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());
	let argument = args.join(" ");

	// in the case of no mentions
	if (!user_avatar) {
		if (argument === 'server')
			try {
				let filename = message.guild.iconURL({
					format: 'gif'
				});
				message.channel.send(new Discord.MessageEmbed()
					.setTitle(`Ícone do servidor ${message.guild.name}`)
					.attachFiles([new Discord.MessageAttachment(filename)])
					.setImage(`attachment://${filename}`)
					.setColor("#00FF00"));
				return;
			} catch (e) {
				console.log("Image was not a gif, using original.");
				message.channel.send(new Discord.MessageEmbed()
					.setTitle(`Ícone do servidor ${message.guild.name}`)
					.setImage(message.guild.iconURL())
					.setColor("#00FF00"));
				return;
			}

	} else {
		try {
			let filename = message.author.displayAvatarURL({
				format: 'gif'
			});
			message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.attachFiles([new Discord.MessageAttachment(filename)])
				.setImage(`attachment://${filename}`)
				.setColor("#00FF00"));
			return;
		} catch (e) {
			console.log("Image was not a gif, using original.");
			message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setImage(message.author.displayAvatarURL({
					format: "gif"
				}))
				.setColor("#00FF00"));
			return;
		}
	}

	// in the case of mentions
	try {
		let filename = user_avatar.user.displayAvatarURL({
			format: 'gif'
		});
		message.channel.send(new Discord.MessageEmbed()
			.setTitle(`Avatar de **${user_avatar.user.username}**`)
			.attachFiles([new Discord.MessageAttachment(filename)])
			.setImage(`attachment://${filename}`)
			.setColor("#00FF00"));
		return;
	} catch (e) {
		console.log("Image was not a gif, using original.");
		message.channel.send(new Discord.MessageEmbed()
			.setTitle(`Avatar de **${user_avatar.user.username}**`)
			.setImage(user_avatar.user.displayAvatarURL())
			.setColor("#00FF00"));
		return;
	}

}
module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}