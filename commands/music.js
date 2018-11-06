const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ms = require("ms");

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
			url: song_info.video_url,
			thumbnail: song_info.thumbnail_url,
			length: song_info.length_seconds,
			author: message.author.id,
			media_artist: song_info.media.artist,
			media_album: song_info.media.album,
			media_writers: song_info.media.writers,
			media_type: song_info.media.category
		};
	} else {
		const arg_embed = new Discord.RichEmbed()
			.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
			.setColor("#00FF00");

		var playing = true;
		switch (url) {
			case "pause":
				{
					try {
						dispatcher.pause();
						return message.channel.send(arg_embed
							.setTitle("Reprodução pausada."));
					} catch (error) {
						console.log(error);
						return message.channel.send(arg_embed
							.setTitle("Não tem nada tocando para ser pausado.")
							.setColor("#FF0000"));
					}
				}
			case "play":
				{
					try {
						dispatcher.resume();
						return message.channel.send(arg_embed
							.setTitle("Reprodução continuada."));
					} catch (error) {
						console.log(error);
						return message.channel.send(arg_embed
							.setTitle("Você primeiro precisa pausar algo para depois continuar.")
							.setColor("#FF0000"));
					}
				}
			case "leave":
				{
					try {
						leaving = true;
						voiceChannel.leave();
						queue.delete(message.guild.id);
						return message.channel.send(arg_embed
							.setTitle("Saí do canal de voz e apaguei minha fila."));
					} catch (error) {
						console.log(error);
					}
				}
			case "queue":
				{

					// will be a long job

					return message.channel.send(arg_embed
						.setTitle("Trabalhando nesse comando..."));
				}
			case "skip":
				{
					try {
						dispatcher.end();
						return message.channel.send(arg_embed
							.setTitle(`**${song.title}** pulado.`));
					} catch (error) {
						console.log(error);
						return message.channel.send(arg_embed
							.setTitle("Não tem nada tocando que possa ser pulado.")
							.setColor("#FF0000"));
					}
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

	var minutes = Math.floor(song.length / 60);
	var seconds = song.length % 60;

	// message filtering for rich embed of 'agora tocando'
	var seconds_str = `${seconds}`;
	var minutes_str = `${minutes}`;
	var artist_str = `${song.media_artist}`;
	var album_str = `${song.media_album}`;
	var writers_str = `${song.media_writers}`;

	if (seconds < 10) seconds_str = `0${seconds}`;
	if (minutes < 1) minutes_str = "00";
	if (artist_str === 'undefined') artist_str = 'Indisponível';
	if (album_str === 'undefined') album_str = 'Indisponível';
	if (writers_str === 'undefined') writers_str === 'Indisponível';

	var music_embed = new Discord.RichEmbed()
		.addField("Agora tocando", `**[${song.title}](${song.url})**`, true)
		.addField("Adicionado por", `[<@${song.author}>]`, true)
		.addField("Duração", `${minutes_str}:${seconds_str}`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	if (song.media_type === 'Music') {
		music_embed
			.addField("Artista", `*${artist_str}*`, true)
			.addField("Álbum", `*${album_str}*`, true)
			.addField("Escritores", `*${writers_str}*`, true)
	}

	message.channel.send(music_embed);

	dispatcher.on('end', () => {
		console.log(`${song.title} finished.`);
		console.log("songs in queue: ");
		console.log(serverQueue.songs);

		if (serverQueue.songs.length === 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();

			if (!leaving)
				message.channel.send(new Discord.RichEmbed()
					.setTitle("Fim da queue, saí do canal de voz.")
					.setColor("#00FF00"))

			return;
		}

		serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
	});

	dispatcher.on('error', error => console.log(error));
}

module.exports.help = {
	name: "music"
}