const Discord = require("discord.js");

var apple = 1;
module.exports.run = async (bot, message, args) =>
{
	const argument = args.join(" ");
	message.channel.send(`arg1: ${args[0]} | arg2: ${args[1]} | arg3: ${args[2]}`);
	message.channel.send(`${apple} apples`);
	apple++;
	return message.channel.send(`argument: ${argument}`);
}

module.exports.help = {
	name: "test"
}