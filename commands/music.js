const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const queue = new Map();
var leaving = false;
var dispatcher;

module.exports.run = async (bot, message, args) => {
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	const url = args.join(" ");
	let yt_url = true;
	if (url === 'play' ||
		url === 'pause' ||
		url === 'leave' ||
		url === 'skip' ||
		url === 'queue' ||
		url === 'volume') {
		yt_url = false;
	}

	if (!voiceChannel) {
		return message.channel.send(voice_embed
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	var song_info;
	var song;
	if (yt_url) {
		song_info = await ytdl.getInfo(url);
		song = {
			title: song_info.title,
			url: song_info.video_url
		};
	} else {
		const arg_embed = new Discord.RichEmbed()
			.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
			.setColor("#00FF00");

		var playing = true;
		switch (url) {
			case "pause":
				{
					if (playing) {
						playing = false;
						dispatcher.pause();
						return message.channel.send(arg_embed
							.setTitle("Reprodução pausada."));
					} else {
						return message.channel.send(arg_embed
							.setTitle("Não tem nada tocando para ser pausado.")
							.setColor("#FF0000"));
					}
				}
			case "play":
				{
					if (!playing) {
						playing = true;
						dispatcher.resume();
						return message.channel.send(arg_embed
							.setTitle("Reprodução continuada."));
					}
				}
			case "leave":
				{
					if (!bot.member.voiceChannel) {
						return message.channel.send(arg_embed
							.setTitle("Não estou conectado a nenhum canal de voz.")
							.setColor("#FF0000"));
					}

					leaving = true;
					voiceChannel.leave();
					queue.delete(message.guild.id);
					return message.channel.send(arg_embed
						.setTitle("Saí do canal de voz e apaguei minha fila."));
				}
			case "queue":
				{

					// will be a long job

					return message.channel.send(arg_embed
						.setTitle("Trabalhando nesse comando..."));
				}
			case "skip":
				{
					dispatcher.end();
					return message.channel.send(arg_embed
						.setTitle("Trabalhando nesse comando..."));
				}
			case "volume":
				{

					// not important do later lol

					return message.channel.send(arg_embed
						.setTitle("Trabalhando nesse comando..."));
				}
			default:
				break;
		}
	}

	leaving = false;
	if (!serverQueue) {
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

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(bot, message, message.guild, queueConstruct.songs[0]);

		} catch (e) {
			console.log(`Bot could not join a voice channel: + ${e}`);

			queue.delete(message.guild.id);

			return message.channel.send(voice_embed
				.setTitle("Não foi possível conectar ao canal de voz.")
				.setColor("#FF0000"));
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		await message.delete();
		return message.channel.send(voice_embed
			.setTitle(`Foi adicionado à fila: **${song.title}** `)
			.setColor("#00FF00")
			.setURL(song.url));
	}
}

function play(bot, message, guild, song) {
	var serverQueue = queue.get(guild.id);
	if (!leaving) {
		dispatcher = serverQueue.connection.playStream(ytdl(song.url));
	} else return;

	message.channel.send(new Discord.RichEmbed()
		.addField(`Agora tocando **${song.title}**`, song.url)
		.setURL(song.url)
		.setColor("#00FF00"));

	dispatcher.on('end', () => {
		console.log("song ended.");
		console.log("songs in queue: ");
		console.log(serverQueue.songs);

		if (serverQueue.songs.length === 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();
			return message.channel.send(new Discord.RichEmbed()
				.setTitle("Fim da queue, saí do canal de voz.")
				.setColor("#00FF00"));
		}

		serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
	});

	dispatcher.on('error', error => console.log(error));
}

module.exports.help = {
	name: "music"
}