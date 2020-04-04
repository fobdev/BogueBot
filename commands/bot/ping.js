const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
	var ping = await bot.ping;
	message.channel.send('autodeploy test sucess.');
	return message.channel.send(new Discord.RichEmbed()
		.setDescription(`**${bot.user.username} Ping: ${Math.floor(ping)}ms**`)
		.setColor("#00FF00"));
}

module.exports.help = {
	name: 'ping',
	descr: 'Mostra o ping atual do servidor do bot.'
}