const Discord = require('discord.js');

module.exports.run = async (bot, message, args) =>
{
	return message.channel.send(new Discord.RichEmbed()
		.setDescription(`**${bot.user.username} Ping: ${Math.floor(bot.ping)}ms**`)
		.setColor("#00FF00"));
}

module.exports.help = {
	name: 'ping'
}