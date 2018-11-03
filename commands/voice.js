const Discord = require("discord.js");

module.exports.run = async(bot, message, args) =>
{
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	if (message.member.voiceChannel && !message.guild.voiceConnection)
	{
		return message.member.voiceChannel.join()
			.then(connection =>
			{
				message.channel.send(voice_embed
					.setTitle("Entrou no canal com sucesso.")
					.setColor("#00FF00"));
			});
	}
	else
	{
		message.channel.send(voice_embed
			.setTitle("Você deve estar em um canal de voz.")
			.setColor("#FF0000"));
	}
}

module.exports.help = {
	name: "voice"
}