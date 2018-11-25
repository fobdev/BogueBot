const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
	var user_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id);
	var bot_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id);

	var number = 0
	var embed = new Discord.RichEmbed()
		.setTitle('Message will be edited')
		.setDescription(`This is a number that will be raised: ${number}`);

	console.log(`bot messages collected: ${bot_msgcollector.received}`)
	await message.channel.send(embed);
	console.log(`bot messages collected after send: ${bot_msgcollector.received}`)

	user_msgcollector.on('collect', msg => {
		if (msg.content === '>' || msg.content === '<') {

			if (msg.content === '>') number++
			if (msg.content === '<') number--
			msg.delete();

			bot_msgcollector.collected.array()[0].edit(new Discord.RichEmbed()
				.setTitle(embed.title)
				.setDescription(`This is a number that will be raised: ${number}`));
		}

		console.log(`\n\nNUMBER:${number}\n\n`)

	})
}

module.exports.help = {
	name: 'test'
}