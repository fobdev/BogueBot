const Discord = require("discord.js");
const ytdl = require("ytdl-core");

module.exports.run = async (bot, message, args) =>
{
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const url = args.join(" ");

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel)
	{
		return message.channel.send(voice_embed
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	try
	{
		var connection = await voiceChannel.join();
	}
	catch (e)
	{
		console.log(`Bot could not join a voice channel: + ${e}`);
		return message.channel.send(voice_embed
			.setTitle("Não foi possível conectar ao canal de voz.")
			.setColor("#FF0000"));
	}

	if (url == 'leave')
	{
		voiceChannel.leave();
	}
	else
	{
		const dispatcher = await connection.playStream(ytdl(url));
		const song_info = await ytdl.getInfo(url);

		message.channel.send(voice_embed
			.setTitle(`Tocando agora **${song_info.title}**`)
			.setColor("#00FF00"));

		dispatcher.on('end', () =>
		{
			console.log("song ended.")
			voiceChannel.leave();
		});

		dispatcher.on('error', error =>
		{
			console.log(error)
		});
	}

}

module.exports.help = {
	name: "music"
<<<<<<< HEAD
}
=======
}
>>>>>>> 11ae1d12eed69ca34b5defef9717cdb3816dd788
