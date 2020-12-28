const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());
	let argument = args.join(" ");

	if (!user_avatar) {
		if (argument === 'server')
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Ícone do servidor ${message.guild.name}`)
				.setImage(message.guild.iconURL())
				.setColor("#00FF00"));

		console.log(`original 1: ${message.author.displayAvatarURL()}`);

		if (message.author.displayAvatarURL().endsWith(".gif")) {
			let attachPic = message.author.displayAvatarURL({
				format: "gif"
			});
			console.log(`original 2: ${message.author.displayAvatarURL()}`);
			message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.attachFiles([new Discord.MessageAttachment(attachPic)])
				.setImage(`attachment://${attachPic}`)
				.setColor("#00FF00"));
			console.log(`after sending: ${message.author.displayAvatarURL()}`);
		} else {
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setImage(message.author.displayAvatarURL())
				.setColor("#00FF00"));
		}
	}

	if (user_avatar.user.displayAvatarURL().endsWith(".gif")) {
		let attachPic = user_avatar.user.displayAvatarURL({
			format: "gif"
		});
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle(`Avatar de **${user_avatar.user.username}**`)
			.attachFiles([new Discord.MessageAttachment(attachPic)])
			.setImage(`attachment://${attachPic}`)
			.setColor("#00FF00"));
	} else
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle(`Avatar de **${user_avatar.user.username}**`)
			.setImage(user_avatar.user.displayAvatarURL())
			.setColor("#00FF00"));
}

module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}