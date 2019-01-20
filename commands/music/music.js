// Dependencies
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const botconfig = require.main.require('./botconfig.json');
const helper = require.main.require('./core/helper.js');
const fs = require('fs');

// Keys and Maps 
const ytkey = helper.loadKeys("youtube_key");
const youtube = new YouTubeAPI(ytkey);
const queue = new Map();
const subcmd_map = new Discord.Collection();

// Subcommands loader
fs.readdir('commands/music/subcommands/', (e, files) => {
	if (e)
		console.error(e)

	let jsfile = files.filter(f => f.split(".").pop() === "js");
	if (jsfile.length < 1)
		throw new Error("No subcommands found in file.")

	jsfile.forEach(f => {
		let prop = require('./subcommands/' + f);
		if (prop.help.name) {
			subcmd_map.set(prop.help.name, prop);
		} else
			console.error('Subcommand with no command name is impossible to call.')

		if (prop.help.name_2) {
			subcmd_map.set(prop.help.name_2, prop);
		}
	})
})

//////////////////////////////////////////////////
//	      The Core of bot music support			//
//												//
//	All code written by Fobenga and completely 	//
//		available at: github.com/fobenga 		//
//////////////////////////////////////////////////
module.exports.run = async (bot, message, args) => {
	// Adds all the subcommands to a array to be verified later if it is a command or not.
	let subcmd_arr = new Array();
	subcmd_map.forEach((value, key) => {
		subcmd_arr.push(key);
	})

	var servers_pl = 'server';
	if (queue.size !== 1) servers_pl += 's';
	if (queue.size > 0)
		console.log(`[MUSIC]: Streaming to ${queue.size} ${servers_pl}`);

	if (!args[0]) {
		let help_file = require('../bot/help.js')
		return message.channel.send(`${botconfig.prefix}${help_file.help.name} ${this.help.name}`).then(msg => {
			try {
				msg.delete();
			} catch (e) {
				console.error(`${message.guild.name} [self-message]: Could not delete self message.`);
			}
		})
	}

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	var url = args[0];
	var isPlaylist = url.includes('list=');
	var search = args.join(" ");
	var video;
	var videos;

	if (!voiceChannel) {
		return message.channel.send(new Discord.RichEmbed()
			.setTitle("Você **precisa estar em um canal de voz** para usar os comandos de música.")
			.setColor("FF0000"));
	}

	// Playlist support
	if (isPlaylist) {
		try {
			const playlist = await youtube.getPlaylist(url);
			const videosarray = await playlist.getVideos();

			if (videosarray) {
				message.delete();
				let pl_out_embed = new Discord.RichEmbed()
					.setTitle(`Playlist **${playlist.title}**`)
					.setDescription(`Carregando **${videosarray.length}** videos da [playlist](${playlist.url}) de **[${playlist.channelTitle}](${playlist.channel.url})**`)
					.setThumbnail(playlist.thumbnails.default.url)
					.setColor('#00FF00');

				message.channel.send(pl_out_embed).then(async msg => {
					await video_player(bot, message, undefined, serverQueue, voiceChannel, videosarray, url);
					msg.edit(new Discord.RichEmbed()
						.setTitle(pl_out_embed.title)
						.setThumbnail(playlist.thumbnails.default.url)
						.setDescription(`**[${videosarray.length} videos](${playlist.url})** foram adicionados à fila`)
						.addField('\u200B', "Use ``" +
							`${botconfig.prefix}${module.exports.help.name} queue` + "`` para ver a fila completa.")
						.setFooter(`Adicionados por ${message.author.username}`, message.author.displayAvatarURL)
						.setColor('#00FF00'));
				});
			}
		} catch (e) {
			console.error(`${e}: Erro ao carregar playlist.`);
			return message.channel.send(new Discord.RichEmbed()
				.setTitle('Erro ao carregar playlist.')
				.setColor('#FF0000'));
		}
	} else {
		try {
			video = await youtube.getVideo(url);
			await video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);

			try {
				message.delete();
			} catch (e) {
				console.error('Error deleting URL message.');
			}
		} catch (error) {

			// If the inputted message is not a subcommand, searchs a video.
			if (subcmd_arr.indexOf(args[0]) < 0) {

				// Tro to get the args[0] string and puts the string in the search engine.
				const search_limit = 8;
				try {
					videos = await youtube.searchVideos(search, search_limit);
				} catch (e) {

					return message.channel.send(new Discord.RichEmbed()
						.setTitle("Ocorreu um erro na busca.")
						.setColor("#FF0000"));
				}

				// Message Collectors for getting all the bot/user messages and delete them later if needed.
				// Current Time Out: 30s
				var bot_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id, {
					time: 1000 * 30
				})

				bot_msgcollector.on('end', async (messages, reason) => {
					switch (reason) {
						case 'sucess':
							{
								await bot_msgcollector.collected.deleteAll();
								await user_msgcollector.collected.deleteAll();
								return;
							}
						case 'cancelled':
							{
								try {
									user_msgcollector.stop();
									await bot_msgcollector.collected.deleteAll();
									return message.channel.send(new Discord.RichEmbed()
										.setDescription(`A busca por **${search}** foi cancelada`)
										.setColor("#FF0000"))
								} catch (e) {
									console.error('Error deleting all bot message after ending.');
									return;
								}
							}
						case 'incorrect_answer':
							{
								await bot_msgcollector.collected.deleteAll();
								await user_msgcollector.collected.deleteAll();
								return message.channel.send('>help music').then(msg => {
									try {
										msg.delete();
									} catch (e) {
										console.error(`${message.guild.name} [self-message]: Could not delete self message.`);
									}
								});
							}
						case 'no_video':
							{
								return message.channel.send(new Discord.RichEmbed()
									.setDescription(`🚫 Não foram encontrados resultados para **'${search}'**`)
									.setColor('#FF0000'));
							}
						case 'playlist':
							return;
						default:
							{
								await bot_msgcollector.collected.deleteAll();
								return message.channel.send(new Discord.RichEmbed()
									.setDescription(`A busca por **${search}** expirou.`)
									.setColor("#FF0000"));
							}
					}
				})

				// Gets the user input and gets a video from search.
				if (videos.length > 0) {
					// Prints all the videos found in the search (controlled by search_limit).
					var search_embed = new Discord.RichEmbed()
						.setAuthor(`${bot.user.username} Music Player Search`, bot.user.displayAvatarURL)
						.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
						.setColor("#00FF00");

					var nullstr;
					for (let i = 0; i < videos.length; i++) {
						var current_video = await youtube.getVideo(videos[i].url);

						var isLivestream = `Duração: ${module.exports.util.timing(current_video.durationSeconds)}`;
						if (current_video.durationSeconds === 0) isLivestream = '**🔴 Livestream**';

						if (i === 0) nullstr = `Resultados para a busca de '**${search}**'`;
						else nullstr = '\u200B';

						search_embed.addField(nullstr, `${i + 1} - **[${current_video.title}](${current_video.url})**\n` +
							`${isLivestream} **|** Canal: [${current_video.channel.title}](${current_video.channel.url})`);
					}

					message.channel.send(search_embed
						.addField("**Selecione um vídeo da busca respondendo com o numero correspondente.**",
							'Esta mensagem expirará em 30 segundos.'));

					var user_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
						time: 1000 * 30
					});

					user_msgcollector.on('collect', async msg => {
						// Verify if the message is a number between all listed videos or is a cancel command
						if ((parseInt(msg.content) > 0 && parseInt(msg.content) <= search_limit) || msg.content === 'c') {
							if (msg.content === 'c') {
								try {
									await bot_msgcollector.stop('cancelled');
									await user_msgcollector.stop('cancelled');
									return;
								} catch (e) {
									console.error('Error stopping message collectors.');
								}
							}
							// Try to get the selected video ID and set it in the 'video' var
							try {
								video = await youtube.getVideoByID(videos[(parseInt(msg.content) - 1)].id);

								try {
									await user_msgcollector.stop('sucess');
									await bot_msgcollector.stop('sucess');
								} catch (e) {
									console.error('Error handling the stop off all collectors.');
								}

								video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);
							} catch (e) {
								console.error('Error selecting video');
								return message.channel.send(new Discord.RichEmbed()
									.setTitle("Ocorreu um erro ao selecionar o vídeo.")
									.setColor("#FF0000"));
							}
						} else {
							// If didn't verified, restart the search with new collectors
							await bot_msgcollector.stop('incorrect_answer');
							await user_msgcollector.stop('incorrect_answer');
							return;
						}
					})
				} else {
					if (isPlaylist)
						await bot_msgcollector.stop('playlist');
					else
						await bot_msgcollector.stop('no_video');

					return;
				}
			} else {
				if (!serverQueue.voiceChannel) {
					console.error(`USER ERROR: No voice channel detected.`);
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('O bot não está em nenhum canal de voz.')
						.setColor('#FF0000'));
				}

				if (serverQueue.voiceChannel === message.member.voiceChannel)
					subcmd_map.get(url) ? subcmd_map.get(url).run(bot, message, args, serverQueue, url) : undefined;
				else {
					console.error(`USER ERROR: Wrong voice channel.`);
					return message.channel.send(new Discord.RichEmbed()
						.setTitle('Você **precisa estar no mesmo canal de voz do bot** para usar os comandos de música.')
						.setColor('#FF0000'));
				}
			}
		}
	}
}

async function video_player(bot, message, video, serverQueue, voiceChannel, videosarray = [], user_url) {
	// Collect all the information from the 'video' variable
	var unavailable_videos = 0;
	var song_info;
	var song_playlist = new Array();

	if (videosarray.length !== 0) {
		for (let v = 0; v < videosarray.length; v++) {
			try {
				song_info = await youtube.getVideoByID(videosarray[v].id);

				let tbnl = await module.exports.util.thumbnail_getter(song_info);
				if (song_info) {
					song_playlist[v] = {
						id: videosarray[v].id,
						title: song_info.title,
						url: videosarray[v].url,
						thumbnail: tbnl,
						length: song_info.durationSeconds,
						authorID: message.author.id,
						author: message.author,
						channel: song_info.channel.title,
						channel_url: song_info.channel.url
					};
				} else {
					console.error("Error ocurred getting video information.")
				}

				video = videosarray[v];
			} catch (e) {
				unavailable_videos++;

				const error_lim = 2;
				if (unavailable_videos <= error_lim) {
					console.error(`${e}: ${videosarray[v].title}.`);
					message.channel.send(new Discord.RichEmbed()
						.setDescription(`Video **[${videosarray[v].title}](${videosarray[v].url})** indisponível e não adicionado.`)
						.setColor("#FF0000"));
				}

				if (unavailable_videos == error_lim) {
					console.error(`SPAM: Stopped sending messages because of spam.`);
					message.channel.send(new Discord.RichEmbed()
						.setTitle('Vários erros detectados')
						.setDescription('Parando de emitir erros para evitar spam.')
						.setColor('#FF0000'));
				}
			}
		}
	}

	try {
		song_info = await youtube.getVideoByID(video.id);
	} catch (e) {
		console.error(`${e}: [${message.author.username}] Tried to call song info with no song`);
		return message.channel.send(new Discord.RichEmbed()
			.setTitle('🚫 Não tem músicas sendo tocadas no momento.')
			.setColor("#FF0000"));
	}

	try {
		let tbnl = await module.exports.util.thumbnail_getter(song_info);
		var song = {
			id: video.id,
			title: song_info.title,
			url: video.url,
			thumbnail: tbnl,
			length: song_info.durationSeconds,
			authorID: message.author.id,
			author: message.author,
			channel: song_info.channel.title,
			channel_url: song_info.channel.url
		};
	} catch (e) {
		console.error(e);
		return message.channel.send(new Discord.RichEmbed()
			.setTitle("Este vídeo não está disponível, não foi adicionado à fila.")
			.setColor('#FF0000'));
	}

	if (!serverQueue) {
		const queueConstruct = {
			streamdispatcher: null,
			guildname: message.guild.name,
			id: message.guild.id,
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			playing: true
		};

		queue.set(message.guild.id, queueConstruct);

		if (videosarray.length !== 0) {
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					await queueConstruct.songs.push(song_playlist[i]);
				}
			}
		} else {
			await queueConstruct.songs.push(song);
		}

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;

			play(bot, message, queueConstruct.songs[0], user_url);

		} catch (e) {
			console.error(`Bot could not join a voice channel: + ${e}`);

			queue.delete(message.guild.id);

			return message.channel.send(new Discord.RichEmbed()
				.setTitle("Não foi possível conectar ao canal de voz.")
				.setColor("#FF0000"));
		}
	} else {
		if (videosarray.length !== 0) {
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					await serverQueue.songs.push(song_playlist[i]);
				}
			}
		} else {
			serverQueue.songs.push(song);
			var isLivestream = `${module.exports.util.timing(song.length)}`;
			if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

			let verify_qlenstr = "``" + `[${botconfig.prefix}${module.exports.help.name_2} q]` + "`` para ver a fila completa."

			if (serverQueue.songs.length > 2)
				verify_qlenstr += "\n``[" + `${botconfig.prefix}${module.exports.help.name_2} q next ${serverQueue.songs.length - 1}]` + "`` para tocar este video a seguir.";

			return message.channel.send(new Discord.RichEmbed()
				.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
				.addField("Foi adicionado à fila", `**[${song.title}](${song.url})**`)
				.addField(`Duração`, `${isLivestream}`, true)
				.addField(`Posição`, `${serverQueue.songs.length - 1}`, true)
				.addField('\u200B', verify_qlenstr)
				.setThumbnail(song.thumbnail)
				.setFooter(`Adicionado por ${message.author.username}`, message.author.displayAvatarURL)
				.setColor("#00FF00")
				.setURL(song.url));
		}
	}
}

async function play(bot, message, song, user_url) {
	var serverQueue = queue.get(message.guild.id);
	serverQueue.streamdispatcher = await serverQueue.connection.playStream(ytdl(song.url, {
		filter: 'audioonly',
		quality: 'highestaudio',
		highWaterMark: 1024 * 1024 * 2 // 2 MB Audio Buffer
	}));

	// Music embed start
	var isLivestream = `${module.exports.util.timing(song.length)}`;
	if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

	let author_str = `${bot.user.username} Music Player`;

	let remaining_pl = 'restante';
	if (serverQueue.songs.length !== 2) remaining_pl += 's';
	if (serverQueue.songs.length > 1) author_str += ` (${serverQueue.songs.length - 1} ${remaining_pl})`;

	var music_embed = new Discord.RichEmbed()
		.setAuthor(author_str, bot.user.displayAvatarURL)
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`)
		.addField("Duração", `${isLivestream}`, true)
		.addField("Adicionado por", `[<@${song.authorID}>]`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	// Music embed end
	message.channel.send(music_embed);

	serverQueue.streamdispatcher.on('end', async (reason) => {
		if (reason === 'left') {
			serverQueue.voiceChannel.leave();
			queue.delete(message.guild.id);
			console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);
			return message.channel.send(new Discord.RichEmbed()
				.setDescription(`Saí do canal de voz **${serverQueue.voiceChannel}** e apaguei minha fila.`)
				.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
				.setColor("#00FF00"));
		}

		if (serverQueue.songs.length <= 1) {
			queue.delete(message.guild.id);
			serverQueue.voiceChannel.leave();
			console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);

			return message.channel.send(new Discord.RichEmbed()
				.setTitle(`Todos os vídeos da fila de **${message.guild.name}** foram reproduzidos, saindo do canal de voz.`)
				.setFooter(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
				.setColor("#00FF00"));

		}

		if (reason === 'skipped') {
			await message.channel.send(new Discord.RichEmbed()
				.setDescription(`**${message.author.username}** pulou **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
				.setColor("#00FF00"));
			await serverQueue.songs.shift();
			return play(bot, message, serverQueue.songs[0], user_url);
		}

		await serverQueue.songs.shift();
		play(bot, message, serverQueue.songs[0], user_url);
	});

	serverQueue.streamdispatcher.on('error', error => console.error(`A error ocurred in the dispatcher: ${error}`));
}

module.exports.util = {
	timing: function (secs) {
		let sec_num = parseInt(secs, 10);
		let hours = Math.floor(sec_num / 3600) % 24;
		let minutes = Math.floor(sec_num / 60) % 60;
		let seconds = sec_num % 60;
		return [hours, minutes, seconds]
			.map(v => v < 10 ? "0" + v : v)
			.filter((v, i) => v !== "00" || i > 0)
			.join(":");
	},
	thumbnail_getter: function (current_song) {
		let r_tbnl = '';
		try {
			return r_tbnl += current_song.thumbnails.maxres.url;
		} catch (e) {
			try {
				return r_tbnl += current_song.thumbnails.standard.url;
			} catch (e) {
				try {
					return r_tbnl += current_song.thumbnails.high.url;
				} catch (e) {
					try {
						return r_tbnl += current_song.thumbnails.medium.url;
					} catch (e) {
						try {
							return r_tbnl += current_song.thumbnails.default.url;
						} catch (e) {
							return console.error('no thumbnail available');
						}
					}
				}
			}
		}
	}
}

module.exports.help = {
	name: "music",
	name_2: "m",
	name_3: "play",
	name_4: "p"
}