const Discord = require("discord.js");

module.exports.run = async (bot, message, args) =>
{
	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel)
	{
		return message.channel.send(new Discord.RichEmbed()
			.setTitle("Você não está em um canal de voz.")
			.setColor("#FF0000"));
	}
	else
	{
		voiceChannel.leave();
	}

}

module.exports.help = {
	name: "leave"
}