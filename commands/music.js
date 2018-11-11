const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const botconfig = require.main.require("./botconfig.json");
const helper = require.main.require('./core/helper.js');

var ytkey = helper.loadKeys("youtube_key");

const queue = new Map();
const youtube = new YouTube(ytkey)
var leaving = false;
var jumped = false;
var earrape = false;
var song_selected = false;

var dispatcher;

var subcommands = ['earrape', 'p', 'leave', 'l', 'np', 'queue', 'q', 'skip', 's'];
var video;
var url;

module.exports.run = async (bot, message, args) => {
	const voice_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL);

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	url = args[0];
	var search = args.join(" ");

	if (!voiceChannel) {
		return message.channel.send(voice_embed
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	try {
		video = await youtube.getVideo(url);
		message.delete();
	} catch (error) {

		// If the inputted message is not a subcommand, searchs a video.
		if (subcommands.indexOf(args[0]) < 0) {

			// Tro to get the args[0] string and puts the string in the search engine.
			const search_limit = 6;
			try {
				videos = await youtube.searchVideos(search, search_limit);
			} catch (e) {
				console.log(e);

				return message.channel.send(new Discord.RichEmbed()
					.setTitle("Ocorreu um erro na busca.")
					.setColor("#FF0000"));
			}

			// Message Collectors for getting all the bot/user messages and delete them later if needed.
			// Current Time Out: 30s
			var bot_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id, {
				time: 1000 * 30
			})

			bot_msgcollector.on('end', async () => {
				if (!song_selected) {
					await bot_msgcollector.collected.deleteAll();
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('A busca expirou')
						.setColor('#FF0000'));
				}
			})

			// Prints all the videos found in the search (controlled by search_limit).
			var search_embed = new Discord.RichEmbed()
				.setAuthor(`${bot.user.username} Music Player Search`, bot.user.displayAvatarURL)
				.setTitle(`Resultados para a busca de '**${search}**'`)
				.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
				.setColor("#00FF00");

			for (let i = 0; i < videos.length; i++) {
				var current_video = await youtube.getVideo(videos[i].url);
				var isLivestream = `Duração: ${timing(current_video.durationSeconds)}`;
				if (current_video.durationSeconds === 0) isLivestream = '**🔴 Livestream**';

				search_embed.addField('\u200B', `${i + 1} - **[${current_video.title}](${current_video.url})**\n` +
					`${isLivestream} **|** Canal: [${current_video.channel.title}](${current_video.channel.url})`);
			}

			message.channel.send(search_embed
				.addField("**Selecione um vídeo da busca respondendo com o numero correspondente.**"));


			// Gets the user input and gets a video from search.
			if (videos.length > 0) {
				// User input after search (expects a number or char 'c')
				var user_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
					time: 1000 * 30
				})

				user_msgcollector.on('collect', async msg => {
					if ((parseInt(msg.content) > 0 && parseInt(msg.content) <= search_limit) || msg.content === 'c') {
						song_selected = true;

						if (msg.content === 'c') {
							await bot_msgcollector.collected.deleteAll();
							return message.channel.send(new Discord.RichEmbed()
								.setDescription('Busca cancelada.')
								.setColor("#FF0000")).then(async msg => {
								await msg.delete(1000 * 3);
								bot_msgcollector.stop();
								user_msgcollector.stop();
							});
						}
						console.log(parseInt('message content_num:' + msg.content))

						// Try to get the selected video ID and set it in the 'video' var
						try {
							await message.channel.bulkDelete(2);
							console.log(`selected in array: ${parseInt(msg.content) - 1}`);
							video = await youtube.getVideoByID(videos[(parseInt(msg.content) - 1)].id);
							user_msgcollector.stop();
							bot_msgcollector.stop();
							video_player(bot, message, video, serverQueue, voiceChannel);
						} catch (e) {
							console.log(e);
							return message.channel.send(new Discord.RichEmbed()
								.setTitle("Ocorreu um erro ao selecionar o vídeo.")
								.setColor("#FF0000"));
						}
					}
				})
			}
		} else {
			console.log('music subcommand activated.');
			subcmd(bot, message, args, serverQueue, voiceChannel);
		}
	}
}

async function subcmd(bot, message, args, serverQueue, voiceChannel) {
	const arg_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
		.setColor("#00FF00");

	// Subcommands switch
	switch (url) {
		case "earrape":
			{
				if (!earrape) {
					serverQueue.connection.dispatcher.setVolume(200);
					earrape = true;
					return message.channel.send(arg_embed
						.setDescription(`**<@${message.author.id}> explodiu as caixas de som.**`)
						.setColor("#00FF00"));
				} else {
					serverQueue.connection.dispatcher.setVolume(1);
					earrape = false;
					return message.channel.send(arg_embed
						.setDescription(`**O volume voltou ao normal.**`)
						.setColor("#00FF00"));
				}
			}
		case "p":
			{
				// the same command for play and pause
				try {
					if (!dispatcher.paused) {
						dispatcher.pause();
						return message.channel.send(arg_embed
							.setTitle(":pause_button: Reprodução pausada.")
							.setColor("#FFFF00"));
					} else {
						dispatcher.resume();
						return message.channel.send(arg_embed
							.setTitle(":arrow_forward: Reprodução continuada."));
					}
				} catch (error) {
					console.log(error);
					return message.channel.send(arg_embed
						.setTitle("O comando não funcionou como o esperado.")
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
					console.log(error);
					return message.channel.send(arg_embed
						.setTitle("Ocorreu um erro ao sair da sala."));
				}
			}
		case "np":
			{
				try {
					var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);
				} catch (e) {
					console.log('Tried to see a now playing of nothing playing.');
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('**Não tem nada tocando no momento**')
						.setColor('#FF0000'));
				}

				var current_music = serverQueue.songs[0];

				var artist_str = `${current_music.media_artist}`;
				var album_str = `${current_music.media_album}`;
				var writers_str = `${current_music.media_writers}`;

				var isLivestream = `**${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}**`;

				console.log(`Current song LEN: ${serverQueue.songs[0].length}`);
				if (parseInt(serverQueue.songs[0].length) === 0) isLivestream = '**🔴 Livestream**';

				var now_playing_embed = new Discord.RichEmbed()
					.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
					.addField("♪ Agora tocando", `**[${current_music.title}](${current_music.url})**`, true)
					.addField("Adicionado por", `[<@${current_music.author}>]`, true)
					.addField("Tempo", `${isLivestream}`, true)
					.addField("Canal", `[${current_music.channel}](${current_music.channel_url})`, true)
					.setThumbnail(current_music.thumbnail)
					.setColor("#00FF00");

				if (serverQueue.songs.length > 1) now_playing_embed.addField("Restantes na fila", `**${serverQueue.songs.length - 1}**`);

				if (artist_str !== 'undefined') now_playing_embed.addField("Artista", `*${artist_str}*`, true);
				if (album_str !== 'undefined') now_playing_embed.addField("Álbum", `*${album_str}*`, true);
				if (writers_str !== 'undefined') now_playing_embed.addField("Escritores", `*${writers_str}*`, true);

				return message.channel.send(now_playing_embed);
			}
		case "queue":
		case "q":
			{
				var fulltime = 0;
				if (args[1] === 'purge') {
					await serverQueue.songs.splice(1);
					return message.channel.send(arg_embed
						.setDescription(`A Fila de **${message.guild.name}** foi excluída.`)
						.setColor("#00FF00"));
				}

				if (args[1]) {
					for (let i = 0; i < args[1] - 1; i++) {
						jumped = true;
						await dispatcher.end();
					}

					jumped = false;
					await dispatcher.end();
					await message.channel.send(arg_embed
						.setTitle(`Fila pulada para a posição **${args[1]}**`)
						.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
						.setColor("#00FF00"));

					return;
				} else {
					var dispatchertime_seconds = parseInt(Math.floor(dispatcher.time / 1000));

					var isLivestream = `**${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}**\n`;
					if (parseInt(serverQueue.songs[0].length) === 0) isLivestream = '**🔴 Livestream**';

					var queue_embed = new Discord.RichEmbed()
						.addField('♪ Agora Tocando', `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
						.addField(`${isLivestream}\n`, '\u200B')
						.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
						.setThumbnail(serverQueue.songs[0].thumbnail)
						.setColor("#00FF00");


					for (let i = 0; i < serverQueue.songs.length; i++) {
						if (i !== 0) {
							var inQueueIsLivestream = `Duração: ${timing(serverQueue.songs[i].length)}`
							if (parseInt(serverQueue.songs[i].length) === 0) inQueueIsLivestream = '**🔴 Livestream**';

							queue_embed.addField('\u200B', `**${i} - [${serverQueue.songs[i].title}](${serverQueue.songs[i].url})**\n` +
								`Duração: ${inQueueIsLivestream}\nAdicionado por: [<@${serverQueue.songs[i].author}>]`);
						}

						fulltime += parseInt(serverQueue.songs[i].length);
					}

					queue_embed.setFooter(`${serverQueue.songs.length} na fila atual - Tempo restante: ${timing(fulltime - dispatchertime_seconds)}`, bot.user.displayAvatarURL);
					return message.channel.send(queue_embed
						.addField('\u200B', "**Use ``" + `${botconfig.prefix}${module.exports.help.name}` + " queue [numero]`` " +
							"para pular para qualquer posição da fila.**"));
				}
			}
		case "skip":
		case "s":
			{
				try {
					if (dispatcher.speaking) {
						await message.channel.send(arg_embed
							.setDescription(`**${message.author.username}** pulou **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`));
						await dispatcher.end();
						return;
					} else {
						return message.channel.send(arg_embed
							.setTitle("Não tem nada tocando que possa ser pulado.")
							.setColor("#FF0000"));
					}
				} catch (error) {
					return console.log(error);
				}
			}
		default:
			break;
	}
}

async function video_player(bot, message, video, serverQueue, voiceChannel) {
	console.log('musica entrou')
	// Collect all the information from the 'video' variable
	try {
		var song_info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.id}`);
	} catch (e) {
		console.error(`[${message.author.username}] Tried to call song info with no song`);
		return message.channel.send(new Discord.RichEmbed()
			.setTitle('🚫 Não tem músicas sendo tocadas no momento.')
			.setColor("#FF0000"));
	}

	var song = {
		id: video.id,
		title: song_info.title,
		url: `https://www.youtube.com/watch?v=${video.id}`,
		thumbnail: song_info.thumbnail_url,
		length: song_info.length_seconds,
		author: message.author.id,
		channel: song_info.author.name,
		channel_url: song_info.author.channel_url,
		media_artist: song_info.media.artist,
		media_album: song_info.media.album,
		media_writers: song_info.media.writers,
		media_type: song_info.media.category
	};

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

		var isLivestream = `${timing(song.length)}`;
		if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

		return message.channel.send(voice_embed
			.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
			.addField("Foi adicionado à fila", `[${song.title}](${song.url})`, true)
			.addField(`Duração`, `${isLivestream}`, true)
			.addField(`Posição`, `${serverQueue.songs.length}`, true)
			.setThumbnail(song.thumbnail)
			.setDescription("``" + `[${botconfig.prefix}${module.exports.help.name} queue]` + "``" + ` para ver a fila completa.`)
			.setColor("#00FF00")
			.setURL(song.url));
	}
}

async function play(bot, message, guild, song) {
	var serverQueue = queue.get(guild.id);
	if (!leaving) {
		song_selected = false;
		dispatcher = await serverQueue.connection.playStream(ytdl(song.url, {
			highWaterMark: 1024 * 1024 * 2,
			quality: 'highestaudio'
		}));
	} else return;

	// message filtering for rich embed of 'agora tocando'
	var artist_str = `${song.media_artist}`;
	var album_str = `${song.media_album}`;
	var writers_str = `${song.media_writers}`;

	var isLivestream = `${timing(song.length)}`;
	if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';


	var music_embed = new Discord.RichEmbed()
		.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`, true)
		.addField("Adicionado por", `[<@${song.author}>]`, true)
		.addField("Duração", `${isLivestream}`, true)
		.addField("Canal", `[${song.channel}](${song.channel_url})`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	if (serverQueue.songs.length > 1) music_embed.addField("Restantes na fila", `**${serverQueue.songs.length - 1}**`);

	if (artist_str !== 'undefined') music_embed.addField("Artista", `*${artist_str}*`, true);
	if (album_str !== 'undefined') music_embed.addField("Álbum", `*${album_str}*`, true);
	if (writers_str !== 'undefined') music_embed.addField("Escritores", `*${writers_str}*`, true);

	if (!jumped)
		await message.channel.send(music_embed);

	dispatcher.on('end', () => {
		if (serverQueue.songs.length === 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();

			if (!leaving)
				message.channel.send(new Discord.RichEmbed()
					.setTitle("A fila de músicas acabou.")
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
	name: "m"
}