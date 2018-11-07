const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const botconfig = require("../botconfig.json");

var ytkey;
var local = false;
if (local) {
	const youtube_apikey = require("../bottoken.json");
	ytkey = youtube_apikey.youtube_key;
} else
	ytkey = process.env.YOUTUBE_API_KEY;

const queue = new Map();
const youtube = new YouTube(ytkey)
var leaving = false;
var jumped = false;
var dispatcher;
var isPlaylist = false;
var paused = false;

module.exports.run = async (bot, message, args) => {
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	var url = args[0];
	var search = args.join(" ");

	if (!voiceChannel) {
		return message.channel.send(voice_embed
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	try {
		var video = await youtube.getVideo(url);
	} catch (error) {
		try {
			var videos = await youtube.searchVideos(search, 1);
			var video = await youtube.getVideoByID(videos[0].id);
		} catch (err) {
			console.log(err);
			return message.channel.send(new Discord.RichEmbed()
				.setTitle("Não foram encontrados vídeos.")
				.setColor("#FF0000"));
		}
	}

	var song_info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.id}`);
	var song = {
		id: video.id,
		title: song_info.title,
		url: `https://www.youtube.com/watch?v=${video.id}`,
		thumbnail: song_info.thumbnail_url,
		length: song_info.length_seconds,
		author: message.author.id,
		media_artist: song_info.media.artist,
		media_album: song_info.media.album,
		media_writers: song_info.media.writers,
		media_type: song_info.media.category
	};

	const arg_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
		.setColor("#00FF00");

	switch (url) {
		case "pause":
		case "p":
			{
				try {
					if (!paused) {
						dispatcher.pause();
						paused = true;
						return message.channel.send(arg_embed
							.setTitle(":pause_button: Reprodução pausada.")
							.setColor("#FFFF00"));
					} else {
						console.log(error);
						return message.channel.send(arg_embed
							.setTitle("Não tem nada tocando para ser pausado.")
							.setColor("#FF0000"));
					}
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
					if (paused) {
						dispatcher.resume();
						paused = false;
						return message.channel.send(arg_embed
							.setTitle(":arrow_forward: Reprodução continuada."));
					} else {
						return message.channel.send(arg_embed
							.setTitle("Não tem nada pausado.")
							.setColor("#FF0000"));
					}
				} catch (error) {
					console.log(error);
					return message.channel.send(arg_embed
						.setTitle("Não tem nada pausado.")
						.setColor("#FF0000"));
				}
			}
		case "leave":
		case "l":
			{
				try {
					leaving = true;
					voiceChannel.leave();
					queue.delete(message.guild.id);
					return message.channel.send(arg_embed
						.setTitle("Saí do canal de voz e apaguei minha fila."));
				} catch (error) {
					return console.log(error);
				}
			}
		case "np":
			{
				var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);
				return message.channel.send(new Discord.RichEmbed()
					.setDescription(`**♪ Agora Tocando [${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
					.addField(`${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}`, '\u200B')
					.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
					.setThumbnail(serverQueue.songs[0].thumbnail)
					.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
					.setColor("#00FF00"));
			}
		case "queue":
		case "q":
			{
				var fulltime = 0;
				if (args[1]) {
					for (let i = 0; i < args[1] - 1; i++) {
						jumped = true;
						await dispatcher.end();
					}

					jumped = false;
					await dispatcher.end();
					await message.channel.send(new Discord.RichEmbed()
						.setTitle(`Fila pulada para a posição **${args[1]}**`)
						.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
						.setColor("#00FF00"));

					return;
				} else {
					var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);
					console.log(`DISPATCHER TIMING: ${dispatchertime_seconds}`)
					var queue_embed = new Discord.RichEmbed()
						.addField('\u200B', `:musical_note:** Agora Tocando [${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**` +
							`\n\n**${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}**\n`)
						.setAuthor(`${bot.user.username} Fila de Músicas`, bot.user.displayAvatarURL)
						.setThumbnail(serverQueue.songs[0].thumbnail)
						.setColor("#00FF00");

					for (let i = 1; i < serverQueue.songs.length; i++) {
						queue_embed.addField('\u200B', `**${i} - [${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\n` +
							`Duração: ${timing(serverQueue.songs[i].length)}\nAdicionado por: [<@${serverQueue.songs[i].author}>]`);
						fulltime += parseInt(serverQueue.songs[i].length);
					}

					queue_embed.setFooter(`${serverQueue.songs.length} na fila atual - Total de ${timing(fulltime)}`, bot.user.displayAvatarURL);
					return message.channel.send(queue_embed
						.addField('\u200B', "**Use ``" + `${botconfig.prefix}${this.help.name}` + " queue [numero]`` " +
							"para pular para qualquer posição da fila.**"));
				}
			}
		case "skip":
		case "s":
			{
				try {
					dispatcher.end();
					await message.channel.send(arg_embed
						.setTitle(`**${message.author.username}** pulou a reprodução atual.`));
					return;
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
			message.channel.send(new Discord.RichEmbed()
				.setTitle(`Buscando '${search}' no YouTube...`)
				.setColor("#0000FF"));
			break;
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

		if (isPlaylist) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();

			for (let i = 0; i < videos.length; i++) {
				queueConstruct.songs.push(videos[i]);
			}
		}

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
		await message.delete();
		return message.channel.send(voice_embed
			.setTitle(`Foi adicionado à fila: **${song.title}** `)
			.setThumbnail(song.thumbnail)
			.setDescription(`[${botconfig.prefix}${this.help.name} queue] para ver a fila completa.`)
			.setColor("#00FF00")
			.setURL(song.url));
	}

}

function play(bot, message, guild, song) {
	var serverQueue = queue.get(guild.id);
	if (!leaving) {
		dispatcher = serverQueue.connection.playStream(ytdl(song.url));
	} else return;

	// message filtering for rich embed of 'agora tocando'
	var artist_str = `${song.media_artist}`;
	var album_str = `${song.media_album}`;
	var writers_str = `${song.media_writers}`;

	var music_embed = new Discord.RichEmbed()
		.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`, true)
		.addField("Adicionado por", `[<@${song.author}>]`, true)
		.addField("Duração", `${timing(song.length)}`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	if (artist_str !== 'undefined') music_embed.addField("Artista", `*${artist_str}*`, true);
	if (album_str !== 'undefined') music_embed.addField("Álbum", `*${album_str}*`, true);
	if (writers_str !== 'undefined') music_embed.addField("Escritores", `*${writers_str}*`, true);

	if (!jumped)
		message.channel.send(music_embed);

	dispatcher.on('end', () => {

		if (serverQueue.songs.length === 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();

			if (!leaving)
				message.channel.send(new Discord.RichEmbed()
					.setTitle("Fim da queue, saí do canal de voz.")
					.setColor("#00FF00"));

			return;
		}

		serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
	});

	dispatcher.on('error', error => console.log(error));
}

function timing(secs) {
	var sec_num = parseInt(secs, 10);
	var hours = Math.floor(sec_num / 3600) % 24;
	var minutes = Math.floor(sec_num / 60) % 60;
	var seconds = sec_num % 60;
	return [hours, minutes, seconds]
		.map(v => v < 10 ? "0" + v : v)
		.filter((v, i) => v !== "00" || i > 0)
		.join(":");
}

module.exports.help = {
	name: "music",
	name: "m"
}