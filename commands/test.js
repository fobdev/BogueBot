const Discord = require("discord.js");

module.exports.run = async (bot, message, args) =>
{
	const argument = args.join(" ");
	message.channel.send(`arg1: ${args[0]} | arg2: ${args[1]} | arg3: ${args[2]}`);
	return message.channel.send(`argument: ${argument}`);
}

module.exports.help = {
	name: "test"
}