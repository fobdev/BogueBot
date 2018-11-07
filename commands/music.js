const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const botconfig = require("../botconfig.json");

const queue = new Map();
var leaving = false;
var dispatcher;
var jumped = false;

module.exports.run = async (bot, message, args) => {
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	var url = args[0];
	let yt_url = true;
	if (url === 'play' ||
		url === 'pause' ||
		url === 'leave' || url === 'l' ||
		url === 'skip' || url === 's' ||
		url === 'queue' || url === 'q' ||
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
	}

	const arg_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
		.setColor("#00FF00");

	var paused = false;
	switch (url) {
		case "pause":
			{
				try {
					if (!paused) {
						dispatcher.pause();
						paused = true;
						return message.channel.send(arg_embed
							.setTitle("Reprodução pausada.")
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
							.setTitle("Reprodução continuada."));
					} else {
						return message.channel.send(arg_embed
							.setTitle("Você primeiro precisa pausar algo para depois continuar.")
							.setColor("#FF0000"));
					}
				} catch (error) {
					console.log(error);
					return message.channel.send(arg_embed
						.setTitle("Você primeiro precisa pausar algo para depois continuar.")
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
					var queue_embed = new Discord.RichEmbed()
						.addField('\u200B', `**Agora Tocando [${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**` +
							`\nDuração: ${timing(serverQueue.songs[0].length)}`)
						.setAuthor(`${bot.user.username} Fila de Músicas`, bot.user.displayAvatarURL)
						.setThumbnail(serverQueue.songs[0].thumbnail)
						.setColor("#00FF00");

					if (serverQueue.songs.length === 1) {
						return message.channel.send(queue_embed
							.setTitle("Não tem músicas na fila")
							.setColor("#FF0000"));
					}

					for (let i = 1; i < serverQueue.songs.length; i++) {
						queue_embed.addField('\u200B', `**${i} - [${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\n` +
							`Duração: ${timing(serverQueue.songs[i].length)}\nAdicionado por: [<@${serverQueue.songs[i].author}>]`);
						fulltime += parseInt(serverQueue.songs[i].length);
					}

					queue_embed.setFooter(`${serverQueue.songs.length} na fila atual - Total de ${timing(fulltime)}`, bot.user.displayAvatarURL);
					return message.channel.send(queue_embed
						.addField('\u200B', "**Use ``" + `${botconfig.prefix}${this.help.name}` + "queue [numero]`` " +
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
		.setAuthor(`${bot.user.username} Música`, bot.user.displayAvatarURL)
		.addField("Agora tocando", `**[${song.title}](${song.url})**`, true)
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