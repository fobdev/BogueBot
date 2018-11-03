const Discord = require("Discord.js");

module.exports.run = async(bot, message, args) =>
{

	if (message.member.voiceChannel && message.guild.voiceConnection)
	{

	}
}

module.exports.help = {
	name: "voice"
}