const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const queue = new Map();

module.exports.run = async (bot, message, args) =>
{
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	const url = args.join(" ");

	if (!voiceChannel)
	{
		return message.channel.send(voice_embed
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	var song_info = await ytdl.getInfo(url);
	var song = {
		title: song_info.title,
		url: song_info.video_url
	};

	if (!serverQueue)
	{
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};

		queue.set(message.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try
		{
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(bot, message, message.guild, queueConstruct.songs[0]);

		}
		catch (e)
		{
			console.log(`Bot could not join a voice channel: + ${e}`);

			queue.delete(message.guild.id);

			return message.channel.send(voice_embed
				.setTitle("Não foi possível conectar ao canal de voz.")
				.setColor("#FF0000"));
		}
	}
	else
	{
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		await message.delete();
		return message.channel.send(voice_embed
			.setTitle(`**${song.title}** foi adicionado à fila`)
			.setColor("#00FF00")
			.setURL(song.url));
	}
}

function play(bot, message, guild, song)
{
	var serverQueue = queue.get(guild.id);
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url));

	if (!song)
	{
		queue.delete(guild.id);
		serverQueue.voiceChannel.leave();

		return message.channel.send(voice_embed
			.setTitle("Fim da queue, saí do canal de voz.")
			.setColor("#00FF00"));
	}

	message.delete();
	message.channel.send(new Discord.RichEmbed()
		.setTitle(`Agora tocando **${song.title}**`)
		.setFooter(`Chamado por ${bot.user.username}`, bot.user.displayAvatarURL)
		.setURL(song.url)
		.setColor("#00FF00"));

	dispatcher.on('end', () =>
	{
		console.log("song ended.")

		serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
	});

	dispatcher.on('error', error => console.log(error));
}

module.exports.help = {
	name: "music"
}