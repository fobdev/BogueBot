const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let user_avatar = message.guild.member(message.mentions.users.first());
	let argument = args.join(" ");

	// in the case of no mentions
	if (!user_avatar) {
		if (argument === 'server')
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Ícone do servidor ${message.guild.name}`)
				.setImage(message.guild.iconURL({
					format: 'gif'
				}))
				.setColor("#00FF00"));
		else
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle(`Avatar de **${message.author.username}**`)
				.setImage(message.author.displayAvatarURL({
					format: 'gif'
				}))
				.setColor("#00FF00"));
	}


	try {
		let gifverif = user_avatar.user.displayAvatarURL({
			format: 'gif'
		});
	} catch (e) {
		console.log(e);
	}

	return message.channel.send(new Discord.MessageEmbed()
		.setTitle(`Avatar de **${user_avatar.user.username}**`)
		.setImage(user_avatar.user.displayAvatarURL({
			format: 'gif'
		}))
		.setColor('#00FF00'))
}
module.exports.help = {
	name: "avatar",
	descr: 'Mostra o avatar de um usuário.',
	arg: ['membro']
}