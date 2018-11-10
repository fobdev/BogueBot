const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	const user_collector = new Discord.MessageCollector(message.channel, msg => msg.author.id === message.author.id, {
		time: 1000 * 10
	});

	const bot_collector = new Discord.MessageCollector(message.channel, msg => msg.author.id === bot.user.id, {
		time: 1000 * 10
	});

	message.channel.send("Do you like me?");
	user_collector.on('collect', async message => {

		if (message.content === "yes") {
			await user_collector.collected.deleteAll();
			return message.channel.send("Awww, thanks.");
		} else if (message.content === "no") {
			await user_collector.collected.deleteAll();
			return message.channel.send("Oh...");
		}
	})

	user_collector.on('end', () => {
		var collected_array = user_collector.collected.array()[0];
		if (collected_array == 'yes' || collected_array == 'no') {
			return message.channel.send("Finished sucessfully");
		} else {
			bot_collector.collected.deleteAll();
			return message.channel.send('Message timed out');
		}
	})
}

module.exports.help = {
	name: "test"
}