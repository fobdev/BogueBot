const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	return message.channel.send(new Discord.RichEmbed()
		.setTitle("Comando indisponível no momento")
		.setDescription(`No momento, o comando de música está indisponível.
	Está sendo trabalhado para que o sistema volte ao normal, tente mais tarde.`)
		.setColor('#FF0000'));
}

module.exports.help = {
	name: "music",
	name_2: "m",
	name_3: "play",
	name_4: "p"
}