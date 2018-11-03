const Discord = require("discord.js");

module.exports.run = async(bot, message, args) =>
{
	if (message.member.voiceChannel && message.guild.voiceConnection)
	{
		message.member.voiceChannel.join();
	}
}

module.exports.help = {
	name: "voice"
}