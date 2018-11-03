const Discord = require("discord.js");

module.exports.run = async (bot, message, args) =>
{
	let user_mention = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

	if (!user_mention)
	{
		return message.channel.send(new Discord.RichEmbed()
			.setTitle(`Você deve especificar um membro de ` +
				`**${message.guild.name}**`)
			.setColor("#FF0000")
			.setFooter(`Requisitado por ${message.author.username}`, message.author.displayAvatarURL));
	}

	if (user_mention.id === '244270921286811648')
	{
		return message.channel.send(`A mãe do <@${user_mention.id}> é linda`);
	}
	return message.channel.send(`A mãe do <@${user_mention.id}> é puta`);
}

module.exports.help = {
	name: "mae"
}