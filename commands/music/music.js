// dependencies
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const fs = require('fs');
const help_file = require('../bot/help.js');
const youtube = new YouTubeAPI(`AIzaSyDIKUD2WatP-lZw5M0HCJ5oULlf5vmmdcI`);

module.exports.main = require('../../BogueBot.js');
module.exports.queue = new Map();
const subcmd_map = new Discord.Collection();

// subcommands loader
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
	if (message.author.id != '244270921286811648') {
		console.log(">Attempt to use music command");
		message.channel.send(new Discord.MessageEmbed()
			.setTitle("Manutenção da API")
			.setDescription("O comando de música está indisponível no momento.")
			.setColor("#FFFF00"));
		return;
	}

	// guild prefix loader
	let prefix = await (await this.main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;

	// Adds all the subcommands to a array to be verified later if it is a command or not.
	let subcmd_arr = new Array();
	subcmd_map.forEach((value, key) => {
		subcmd_arr.push(key);
	})

	// logs the amount of streaming services
	let servers_pl = 'server';
	if (this.queue.size !== 1) servers_pl += 's';
	if (this.queue.size > 0)
		console.log(`[MUSIC]: Streaming to ${this.queue.size} ${servers_pl}`);

	if (args[0] == 'stream-status') {
		if (message.author.id == '244270921286811648') {
			console.log(`[MUSIC]: Streaming to ${this.queue.size} ${servers_pl}`);
			return message.channel.send(`[${this.queue.size}] streaming instances running.`);
		} else
			return message.channel.send(new Discord.MessageEmbed()
				.setTitle('Erro')
				.setDescription('Comando apenas para desenvolvedores.')
				.setColor('#FF0000'));
	}

	// runs a help command in case there is no argument
	if (!args[0]) {
		return message.channel.send(`${prefix}${help_file.help.name} ${this.help.name}`).then(msg => {
			try {
				msg.delete();
			} catch (e) {
				console.error(`${message.guild.name} [self-message]: Could not delete self message.`);
			}
		})
	}

	const voiceChannel = await message.member.voice.channel;
	let serverQueue = this.queue.get(message.guild.id);
	let url = args[0];
	let isPlaylist = url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/);
	let ytvideo_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	let search = args.join(" ");
	let video;
	let videos;

	yt_parseURL = (url) => {
		let match = url.match(ytvideo_regex);
		return (match && match[7].length == 11) ? match[7] : false;
	}

	if (!voiceChannel)
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle(`${message.author.username} não está em nenhum canal de voz`)
			.setDescription('Você deve estar em um canal de voz para usar os comandos de música')
			.setColor("#FF0000"));

	// Playlist support
	if (isPlaylist) {
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle("Erro")
			.setDescription('O suporte a playlists do YouTube e Spotify não está disponível no momento')
			.setColor('#FFFF00'));

		const output_error = new Discord.MessageEmbed()
			.setTitle('Erro ao carregar playlist.')
			.setColor('#FF0000');
		try {
			youtube.getPlaylistByID(url.split('list=')[1]).then(async playlist => {
				if (playlist) {
					console.log(`Playlist ${playlist.title} added to the queue.`);

					await playlist.getVideos().then(async videosarray => {
						await message.delete();
						let pl_out_embed = new Discord.MessageEmbed()
							.setTitle(`Playlist **${playlist.title}**`)
							.setDescription(`Carregando **${videosarray.length}** videos da [playlist](${playlist.url}) de **[${playlist.channelTitle}](${playlist.channel.url})**`)
							.setThumbnail(playlist.thumbnails.default.url)
							.setColor('#00FF00');

						message.channel.send(pl_out_embed).then(async msg => {
							await this.video_player(bot, message, undefined, serverQueue, voiceChannel, videosarray, url);
							msg.edit(new Discord.MessageEmbed()
								.setTitle(pl_out_embed.title)
								.setThumbnail(playlist.thumbnails.default.url)
								.setDescription(`**[${videosarray.length - this.unavailable_videos} videos](${playlist.url})** foram adicionados à fila`)
								.addField('\u200B', "Use ``" +
									`${prefix}${module.exports.help.name} queue` + "`` para ver a fila completa.")
								.setFooter(`Adicionados por ${message.author.username}`, message.author.displayAvatarURL())
								.setColor('#00FF00'));
						});
					}).catch(e => message.channel.send(output_error).then(console.log(`${e}: Erro ao carregar os vídeos`)));
				}
			}).catch(e => message.channel.send(output_error).then(console.log(`${e}: The playlist is private or doesn't exist.`)))
		} catch (e) {
			return message.channel.send(output_error).then(console.error(e));
		}
	} else {
		// plays the inputted url if isn't a search nor a subcommand
		try {
			video = await youtube.getVideoByID(yt_parseURL(url));
			await this.video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);
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
					console.log(e);

					// console.log(`Stream failed to initialize in server [${serverQueue.guildname}]`)
					return message.channel.send(new Discord.MessageEmbed()
						.setTitle("Ocorreu um erro na busca.")
						.setDescription(`Pode ocorrer do comando de música estar passando por problemas.
						Se você não conseguir reproduzir um vídeo mesmo enviando o link, mande um feedback de erro:
						` + "```>feedback```")
						.setColor("#FF0000"));
				}

				// Message Collectors for getting all the bot/user messages and delete them later if needed.
				// Current Time Out: 30s
				let bot_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id, {
					time: 1000 * 30
				})

				let user_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
					time: 1000 * 30
				});

				bot_msgcollector.on('end', async (messages, reason) => {
					switch (reason) {
						case 'sucess': {
							bot_msgcollector.collected.each(msg => {
								msg.delete();
							});

							user_msgcollector.collected.each(msg => {
								msg.delete();
							});
							return;
						}
						case 'cancelled': {
							try {
								user_msgcollector.stop();
								bot_msgcollector.collected.each(msg => {
									msg.delete();
								});
								return message.channel.send(new Discord.MessageEmbed()
									.setDescription(`A busca por **${search}** foi cancelada`)
									.setColor("#FF0000"))
							} catch (e) {
								console.error('Error deleting all bot message after ending.');
								return;
							}
						}
						case 'incorrect_answer': {
							bot_msgcollector.collected.each(msg => {
								msg.delete();
							});
							user_msgcollector.collected.each(msg => {
								msg.delete();
							});
							return message.channel.send('>help music').then(msg => {
								try {
									msg.delete();
								} catch (e) {
									console.error(`${message.guild.name} [self-message]: Could not delete self message.`);
								}
							});
						}
						case 'no_video': {
							return message.channel.send(new Discord.MessageEmbed()
								.setDescription(`🚫 Não foram encontrados resultados para **'${search}'**`)
								.setColor('#FF0000'));
						}
						case 'playlist':
							return;
						default: {
							bot_msgcollector.collected.each(msg => {
								msg.delete();
							});
							return message.channel.send(new Discord.MessageEmbed()
								.setDescription(`A busca por **${search}** expirou.`)
								.setColor("#FF0000"));
						}
					}
				})

				// Gets the user input and gets a video from search.
				if (videos.length > 1) {
					if (url.match(ytvideo_regex)) {
						video = await youtube.getVideoByID(videos[0].id);

						user_msgcollector.stop('sucess');
						bot_msgcollector.stop('sucess');

						try {
							message.delete();
						} catch (e) {
							console.error('Error deleting URL message.');
						}

						await this.video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);
					} else {
						// Prints all the videos found in the search (controlled by search_limit).
						let search_embed = new Discord.MessageEmbed()
							.setAuthor(`${bot.user.username} Music Player Search`, bot.user.displayAvatarURL())
							.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL())
							.setColor("#00FF00");

						let nullstr;
						for (let i = 0; i < videos.length; i++) {
							let current_video = await youtube.getVideo(videos[i].url);

							let isLivestream = `Duração: ${module.exports.util.timing(current_video.durationSeconds)}`;
							if (current_video.durationSeconds === 0) isLivestream = '**🔴 Livestream**';

							if (i === 0) nullstr = `Resultados para a busca de '**${search}**'`;
							else nullstr = '\u200B';

							search_embed.addField(nullstr, `${i + 1} - **[${current_video.title}](${current_video.url})**\n` +
								`${isLivestream} **|** Canal: [${current_video.channel.title}](${current_video.channel.url})`);
						}

						message.channel.send(search_embed
							.addField("**Selecione um vídeo da busca respondendo com o numero correspondente.**",
								'Esta mensagem expirará em 30 segundos.'));

						let user_msgcollector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
							time: 1000 * 30
						});

						user_msgcollector.on('collect', async msg => {
							// Verify if the message is a number between all listed videos or is a cancel command
							if ((parseInt(msg.content) > 0 && parseInt(msg.content) <= search_limit) || msg.content === 'c') {
								if (msg.content === 'c') {
									try {
										bot_msgcollector.stop('cancelled');
										user_msgcollector.stop('cancelled');
										return;
									} catch (e) {
										console.error('Error stopping message collectors.');
									}
								}
								// Try to get the selected video ID and set it in the 'video' var
								try {
									video = await youtube.getVideoByID(videos[(parseInt(msg.content) - 1)].id);

									try {
										user_msgcollector.stop('sucess');
										bot_msgcollector.stop('sucess');
									} catch (e) {
										console.error('Error handling the stop off all collectors.');
									}

									this.video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);
								} catch (e) {
									console.error('Error selecting video');
									return message.channel.send(new Discord.MessageEmbed()
										.setTitle("Ocorreu um erro ao selecionar o vídeo.")
										.setColor("#FF0000"));
								}
							} else {
								// If didn't verified, restart the search with new collectors
								bot_msgcollector.stop('incorrect_answer');
								user_msgcollector.stop('incorrect_answer');
								return;
							}
						})
					}
				} else if (videos.length == 1) {
					// plays the only result for the search
					video = await youtube.getVideoByID(videos[0].id);

					user_msgcollector.stop('sucess');
					bot_msgcollector.stop('sucess');

					this.video_player(bot, message, video, serverQueue, voiceChannel, undefined, url);
				} else {
					if (isPlaylist)
						bot_msgcollector.stop('playlist');
					else
						bot_msgcollector.stop('no_video');

					return;
				}
			} else {
				try {
					subcmd_map.get(url) ? subcmd_map.get(url).run(bot, message, args, serverQueue, url) : undefined;
				} catch (e) {
					console.error(`[USER ERROR] The bot is not in a voice channel.`);
					return message.channel.send(new Discord.MessageEmbed()
						.setDescription('O bot não está em nenhum canal de voz.')
						.setColor('#FF0000'));
				}
			}
		}
	}
}

module.exports.video_player = async (bot, message, video, serverQueue, voiceChannel, videosarray = [], user_url) => {
	// Collect all the information from the 'video' variable
	let prefix = await (await this.main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
	let song_info;
	let song_playlist = new Array();
	module.exports.unavailable_videos = 0;

	if (videosarray.length !== 0) {
		for (let v = 0; v < videosarray.length; v++) {
			try {
				song_info = await youtube.getVideoByID(videosarray[v].id);
				let tbnl = this.util.thumbnail_getter(song_info);
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
				console.log(`${e}: Errors detected trying to add videos.`);
				this.unavailable_videos++;
			}
		}
	}

	try {
		song_info = await youtube.getVideoByID(video.id);
	} catch (e) {
		console.error(`${e}: [${message.author.username}] Tried to call song info with no song`);
		return message.channel.send(new Discord.MessageEmbed()
			.setTitle('🚫 Não tem músicas sendo tocadas no momento.')
			.setColor("#FF0000"));
	}

	let song, tbnl;
	try {
		tbnl = module.exports.util.thumbnail_getter(song_info);
		song = {
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
		return message.channel.send(new Discord.MessageEmbed()
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

		this.queue.set(message.guild.id, queueConstruct);
		if (videosarray.length !== 0) {
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					queueConstruct.songs.push(song_playlist[i]);
				}
			}
		} else {
			queueConstruct.songs.push(song);
		}

		let connection;
		try {
			connection = await voiceChannel.join();

			queueConstruct.connection = connection;
			this.play(bot, message, queueConstruct.songs[0], user_url);

		} catch (e) {
			console.error(`Bot could not join a voice channel: + ${e}`);

			this.queue.delete(message.guild.id);

			return message.channel.send(new Discord.MessageEmbed()
				.setTitle("Não foi possível conectar ao canal de voz.")
				.setColor("#FF0000"));
		}

		let users_inchannel = queueConstruct.voiceChannel.members.array();
		console.log(`[STREAM] Stream started in ${queueConstruct.guildname}
		Queue started with: ${queueConstruct.songs[0].title}
		URL: ${queueConstruct.songs[0].url}
		Length: ${module.exports.util.timing(queueConstruct.songs[0].length)}
		Started by: ${message.author.username}
		Users listening: ${users_inchannel.length - 1}`);

	} else {
		if (videosarray.length !== 0) {
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					await serverQueue.songs.push(song_playlist[i]);
				}
			}
		} else {
			serverQueue.songs.push(song);
			let isLivestream = `${module.exports.util.timing(song.length)}`;
			if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';


			let verify_qlenstr = "``" + `[${prefix}${module.exports.help.name_2} q]` + "`` para ver a fila completa."

			if (serverQueue.songs.length > 2)
				verify_qlenstr += "\n``[" + `${prefix}${module.exports.help.name_2} q next ${serverQueue.songs.length - 1}]` + "`` para tocar este video a seguir.";

			let fullqueue_length = 0;
			let users_inchannel = serverQueue.voiceChannel.members.array();
			for (let i = 0; i < serverQueue.songs.length; i++)
				fullqueue_length += serverQueue.songs[i].length;

			console.log(`[STREAM] A video has been added to ${serverQueue.guildname} queue.
			Song title: ${song.title}
			URL: ${song.url}
			Added by: ${message.author.username}
			Length: ${module.exports.util.timing(song.length)}
			Full queue length: ${module.exports.util.timing(fullqueue_length)}
			Users listening: ${users_inchannel.length - 1}`);

			return message.channel.send(new Discord.MessageEmbed()
				.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL())
				.addField("Foi adicionado à fila", `**[${song.title}](${song.url})**`)
				.addField(`Duração`, `${isLivestream}`, true)
				.addField(`Posição`, `${serverQueue.songs.length - 1}`, true)
				.addField('\u200B', verify_qlenstr)
				.setThumbnail(song.thumbnail)
				.setFooter(`Adicionado por ${message.author.username}`, message.author.displayAvatarURL())
				.setColor("#00FF00")
				.setURL(song.url));
		}
	}
}

module.exports.play = async (bot, message, song, user_url) => {
	let prefix = await (await this.main.db.query('SELECT prefix FROM guild WHERE id=$1', [message.guild.id])).rows[0].prefix;
	let serverQueue = this.queue.get(message.guild.id);
	serverQueue.streamdispatcher = await serverQueue.connection.play(ytdl(song.url, {
		filter: 'audioonly',
		quality: 'highestaudio',
		highWaterMark: 1024 * 1024 * 2 // 2 MB Audio Buffer
	}));

	// Music embed start
	let isLivestream = `${module.exports.util.timing(song.length)}`;
	if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

	let author_str = `${bot.user.username} Music Player`;

	let remaining_pl = 'restante';
	if (serverQueue.songs.length !== 2) remaining_pl += 's';
	if (serverQueue.songs.length > 1) author_str += ` (${serverQueue.songs.length - 1} ${remaining_pl})`;

	let musicEmbed = new Discord.MessageEmbed()
		.setAuthor(author_str, bot.user.displayAvatarURL())
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`)
		.addField("Duração", `${isLivestream}`, true)
		.addField("Adicionado por", `[<@${song.authorID}>]`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");
	// Music embed end

	if (serverQueue.songs.length >= 1)
		message.channel.send(musicEmbed);


	serverQueue.streamdispatcher.on('start', () => {
		if (serverQueue.songs.length > 0) {
			this.play(bot, message, serverQueue.songs[0], null);
			serverQueue.songs.shift();
		} else
			this.queue.delete(message.guild.id);


		// let songcalled_voicechannel = serverQueue.voiceChannel.members.array();
		// if (songcalled_voicechannel.length < 2) {
		// 	serverQueue.voiceChannel.leave();
		// 	this.queue.delete(message.guild.id);
		// 	console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);

		// 	const helpfile = require('../bot/help.js');
		// 	console.log('[BOT LEFT]: There is no one in voice channel.');
		// 	return message.channel.send(new Discord.MessageEmbed()
		// 		.setDescription(`Não tem ninguém em **${serverQueue.voiceChannel}**, saindo do canal de voz.`, "Use ``" + `${prefix}${helpfile.help.name} ${module.exports.help.name}` + "`` para ajuda.")
		// 		.setColor('#FFAA00'));
		// }

		if (serverQueue.songs.length < 1) {
			serverQueue.streamdispatcher.destroy();
			serverQueue.voiceChannel.leave();

			this.queue.delete(message.guild.id);
			console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);

			return message.channel.send(new Discord.MessageEmbed()
				.setTitle('Todos os vídeos da fila foram tocados, saindo do canal de voz...')
				.setFooter(`${bot.user.username} Music Player: se houver algum erro de execução, notifique o desenvolvedor com o comando '${prefix}feedback'`, bot.user.displayAvatarURL())
				.setColor('#00FF00'));
		}
	})


	serverQueue.streamdispatcher.on('newSession', async () => {
		console.log('session changed');
	})


	serverQueue.streamdispatcher.on('speaking', async (isSpeaking) => {
		// if (!isSpeaking)
		// 	if (serverQueue.songs.length > 0) {
		// 		this.play(bot, message, serverQueue.songs[0], null);
		// 		serverQueue.songs.shift();
		// 	}
		// else
		// 	this.queue.delete(message.guild.id);

		// let songcalled_voicechannel = serverQueue.voiceChannel.members.array();
		// removed functionality due to bugs: require a current channel verification if the bot is moved

		// if (songcalled_voicechannel.length < 2) {
		// 	serverQueue.voiceChannel.leave();
		// 	this.queue.delete(message.guild.id);
		// 	console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);

		// 	const helpfile = require('../bot/help.js');
		// 	console.log('[BOT LEFT]: There is no one in voice channel.');
		// 	return message.channel.send(new Discord.MessageEmbed()
		// 		.setDescription(`Não tem ninguém em **${serverQueue.voiceChannel}**, saindo do canal de voz.`, "Use ``" + `${prefix}${helpfile.help.name} ${module.exports.help.name}` + "`` para ajuda.")
		// 		.setColor('#FFAA00'));
		// }

		// if (serverQueue.songs.length < 1) {
		// 	await serverQueue.streamdispatcher.destroy();
		// 	serverQueue.voiceChannel.leave();

		// 	this.queue.delete(message.guild.id);
		// 	console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);

		// 	return message.channel.send(new Discord.MessageEmbed()
		// 		.setTitle('Todos os vídeos da fila foram tocados, saindo do canal de voz...')
		// 		.setFooter(`${bot.user.username} Music Player: se houver algum erro de execução, notifique o desenvolvedor com o comando '${prefix}feedback'`, bot.user.displayAvatarURL())
		// 		.setColor('#00FF00'));
		// }
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
		// Try to find and set the best	available thumbnail from the current video
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
							message.channel.send(new Discord.MessageEmbed()
								.setDescription('Não há nenhuma thumbnail disponível para este vídeo.')
								.setColor('#FF000'));
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