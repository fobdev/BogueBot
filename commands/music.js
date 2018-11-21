const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const botconfig = require.main.require("./botconfig.json");
const helper = require.main.require('./core/helper.js');

var ytkey = helper.loadKeys("youtube_key");

const queue = new Map();
const youtube = new YouTube(ytkey);
var jumped = false;
var earrape = false;
var leaving = false;
var dispatcher;

var subcommands = ['earrape', 'p', 'pause', 'leave', 'l', 'np', 'queue', 'q', 'skip', 's'];
var video;
var videos;
var url;
var isPlaylist;

module.exports.run = async (bot, message, args) => {
	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	url = args[0];
	isPlaylist = url.includes('list=');
	var search = args.join(" ");

	if (!voiceChannel) {
		return message.channel.send(new Discord.RichEmbed()
			.setTitle("Você não está em um canal de voz.")
			.setColor("FF0000"));
	}

	// Playlist support
	if (isPlaylist) {
		try {
			const playlist = await youtube.getPlaylist(url);
			const videosarray = await playlist.getVideos();

			if (videosarray) {
				message.channel.send(new Discord.RichEmbed()
					.setDescription(`Carregando playlist **${playlist.title}** de **[${playlist.channelTitle}](${playlist.channel.url})**...`)
					.setColor('#00FF00'));
			}

			await video_player(bot, message, undefined, serverQueue, voiceChannel, videosarray);
		} catch (e) {
			console.error(`${e}: Erro ao carregar playlist.`);
			return message.channel.send(new Discord.RichEmbed()
				.setTitle('Erro ao carregar playlist.')
				.setColor('#FF0000'));
		}
	} else {
		try {
			video = await youtube.getVideo(url);
			await video_player(bot, message, video, serverQueue, voiceChannel);
			try {
				message.delete();
			} catch (e) {
				console.error('Error deleting URL message.');
			}
		} catch (error) {

			// If the inputted message is not a subcommand, searchs a video.
			if (subcommands.indexOf(args[0]) < 0) {

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
								return message.channel.send("```css\n" +
									`[Comandos de música do ${bot.user.username}]
	
	>music [música]....................Toca um vídeo do YouTube / adiciona à fila.
	>music (q)ueue.....................Exibe toda a fila do servidor.
		   (q)ueue [numero]............Pula para uma certa posição da fila.
		   (q)ueue (del)ete [numero]...Exclui um certo item da fila.
		   (q)ueue purge...............Limpa todos os itens da fila.
		   
	>music np.........Mostra informações sobre o que está sendo tocado.
	>music skip.......Pula a reprodução atual.
	>music p..........Pausa ou despausa a reprodução atual.
	>music earrape....Aumenta extremamente o volume da reprodução atual.
	>music (l)eave....Sai do canal de voz e exclui a fila atual.` +
									"```");
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
						var isLivestream = `Duração: ${timing(current_video.durationSeconds)}`;
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
					})

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

								video_player(bot, message, video, serverQueue, voiceChannel);
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
				subcmd(bot, message, args, serverQueue, voiceChannel);
			}
		}
	}

}

async function subcmd(bot, message, args, serverQueue, voiceChannel) {
	const arg_embed = new Discord.RichEmbed()
		.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
		.setColor("#00FF00");

	// Subcommands switch
	switch (url) {
		case "jump":
			{
				if (dispatcher.speaking) {

				} else {
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('Não tem nada sendo tocado no momento.')
						.setColor('#FF0000'));
				}
			}
			break;
			/* 
				TODO:

				'repeat' and 'earrape' commands are not guild-based.
				this commands will set in-bot variables and changed in all guilds.
				Commands with true/false switches need to be set in a guild-based code.
			*/

			// case "repeat":
			// 	{
			// 		// Changes gonna happen in the 'play' function, this is just a switch.
			// 		if (dispatcher.speaking) {
			// 			if (!repeating) {
			// 				repeating = true;
			// 				message.channel.send(new Discord.RichEmbed().setDescription(`Repetindo **${serverQueue.songs[0].title}**`)
			// 					.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
			// 					.setColor("#00FF00"));
			// 			} else {
			// 				repeating = false;
			// 				message.channel.send(new Discord.RichEmbed().setDescription(`Parou de repetir **${serverQueue.songs[0].title}**`)
			// 					.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
			// 					.setColor("#00FF00"));
			// 			}
			// 		} else return message.channel.send(new Discord.RichEmbed()
			// 			.setDescription('Não tem nada tocando no momento')
			// 			.setColor("#FF0000"));
			// 	}
			// 	break;
		case "earrape":
			{
				if (dispatcher.speaking) {
					if (!earrape) {
						serverQueue.connection.dispatcher.setVolume(200);
						earrape = true;
						return message.channel.send(new Discord.RichEmbed()
							.setDescription(`**<@${message.author.id}> ativou earrape.**`)
							.setColor("#00FF00"));
					} else {
						serverQueue.connection.dispatcher.setVolume(1);
						earrape = false;
						return message.channel.send(arg_embed
							.setDescription(`**O volume voltou ao normal.**`)
							.setColor("#00FF00"));
					}
				} else {
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('Não tem nada sendo tocado no momento.')
						.setColor("#FF0000"));
				}
			}
		case "p":
		case "pause":
			{
				// the same command for play and pause
				if (dispatcher.speaking) {
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
						console.error("Command didn't executed as expected");
						return message.channel.send(arg_embed
							.setTitle("O comando não funcionou como o esperado.")
							.setColor("#FF0000"));
					}
				} else {
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('Não tem nada sendo tocado no momento.')
						.setColor("#FF0000"));
				}
			}
		case "leave":
		case "l":
			{
				if (voiceChannel) {
					try {
						leaving = true;
						voiceChannel.leave();
						queue.delete(message.guild.id);
						return message.channel.send(arg_embed
							.setTitle("Saí do canal de voz e apaguei minha fila."));
					} catch (error) {
						console.error("Error ocurred when leaving the voice channel");
						return message.channel.send(arg_embed
							.setTitle("Ocorreu um erro ao sair da sala."));
					}
				} else {
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('Ocorreu um erro ao tentar sair da sala.')
						.setColor("#FF0000"));
				}

			}
		case "np":
			{
				try {
					var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);
				} catch (e) {
					console.error('Tried to see a now playing of nothing playing.');
					return message.channel.send(new Discord.RichEmbed()
						.setDescription('**Não tem nada tocando no momento**')
						.setColor('#FF0000'));
				}

				var current_music = serverQueue.songs[0];

				var artist_str = `${current_music.media_artist}`;
				var album_str = `${current_music.media_album}`;
				var writers_str = `${current_music.media_writers}`;

				var isLivestream = `**${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}**`;

				if (parseInt(serverQueue.songs[0].length) === 0) isLivestream = '**🔴 Livestream**';

				var now_playing_embed = new Discord.RichEmbed()
					.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
					.addField("♪ Agora tocando", `**[${current_music.title}](${current_music.url})**`)
					.addField("Tempo", `${isLivestream}`, true)
					.addField("Adicionado por", `[${current_music.author}]`, true)
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
				try {
					if (args[1] === 'delete' || args[1] === 'del') {
						var entry = parseInt(args[2]);

						if (entry < 1) {
							await message.channel.send(new Discord.RichEmbed()
								.setDescription(`**${message.author.username}** pulou **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`));
							await dispatcher.end();
							return;
						}

						if (!entry) {
							return message.channel.send(new Discord.RichEmbed()
								.setDescription('**Você não especificou o video que quer excluir da fila.**')
								.setColor("#FF0000"));
						}

						if (entry > 0 && entry <= serverQueue.songs.length) {

							message.channel.send(arg_embed
								.setDescription(`**[${serverQueue.songs[entry].title}](${serverQueue.songs[entry].url})**` +
									` foi removido da fila.`));
							await serverQueue.songs.splice(entry, 1);

							return;
						} else {
							return message.channel.send(new Discord.RichEmbed()
								.setDescription('**Não foram encontrados vídeos na fila com este número**')
								.setColor('#FF000'));
						}
					}

					if (args[1] === 'purge') {
						if (serverQueue.songs.length > 1) {
							await serverQueue.songs.splice(1);
							return message.channel.send(arg_embed
								.setDescription(`A Fila de **${message.guild.name}** foi excluída.`)
								.setColor("#00FF00"));
						} else {
							return message.channel.send(arg_embed
								.setTitle(`A fila já está vazia.`)
								.setColor("#FF0000"));
						}
					}

					if (args[1]) {
						if (parseInt(args[1]) > 1 && parseInt(args[1]) <= serverQueue.songs.length) {
							for (let i = 0; i < args[1] - 1; i++) {
								jumped = true;
								await dispatcher.end();
							}

							jumped = false;
							message.channel.send(arg_embed
								.setTitle(`Fila pulada para a posição **${args[1]}**`)
								.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
								.setColor("#00FF00"));

							await dispatcher.end();

							return;
						} else {
							await message.channel.send(arg_embed
								.setDescription(`**Use um valor que seja entre 1 e ${serverQueue.songs.length}**`)
								.setColor("#FF0000"));
						}
					} else {
						var dispatchertime_seconds = parseInt(Math.floor(dispatcher.time / 1000));
						if (serverQueue.songs.length > 9) {
							var ultralarge_queue = '';
							var dispatchertime_seconds = parseInt(Math.floor(dispatcher.time / 1000));

							for (let i = 1; i < serverQueue.songs.length; i++) {
								ultralarge_queue += `${i} - ${serverQueue.songs[i].title} | ${timing(serverQueue.songs[i].length)}\n`;
							}

							return message.channel.send("```markdown\n" +
								`[Fila de ${message.guild.name}]
Agora Tocando: ${serverQueue.songs[0].title} | ${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}

${ultralarge_queue}
` +
								"```")
						}

						if (serverQueue.songs.length < 6) {
							var isLivestream = `**${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}**\n`;
							if (parseInt(serverQueue.songs[0].length) === 0) isLivestream = '**🔴 Livestream**';

							var queue_embed = new Discord.RichEmbed()
								.addField('♪ Agora Tocando', `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`)
								.addField(`${isLivestream}\n`, '\u200B')
								.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
								.setThumbnail(serverQueue.songs[0].thumbnail)
								.setColor("#00FF00");

							var first_entry;
							for (let i = 0; i < serverQueue.songs.length; i++) {
								if (i !== 0) {
									var inQueueIsLivestream = `Duração: ${timing(serverQueue.songs[i].length)}`
									if (parseInt(serverQueue.songs[i].length) === 0) inQueueIsLivestream = '**🔴 Livestream**';

									if (i === 1) first_entry = 'A seguir:';
									else first_entry = '\u200B';

									queue_embed.addField(first_entry, `**${i} - [${serverQueue.songs[i].title}](${serverQueue.songs[i].url})** [<@${serverQueue.songs[i].authorID}>]\n` +
										`${inQueueIsLivestream}`);
								}

								fulltime += parseInt(serverQueue.songs[i].length);
							}

							queue_embed.setFooter(`${serverQueue.songs.length} na fila atual - Tempo restante: ${timing(fulltime - dispatchertime_seconds)}`, bot.user.displayAvatarURL);

							if (serverQueue.songs.length > 1) return message.channel.send(queue_embed
								.addField('\u200B', "**Use ``" + `${botconfig.prefix}${module.exports.help.name}` + " queue [numero]`` " +
									"para pular para qualquer posição.**\n" +
									"**Use ``" + `${botconfig.prefix}${module.exports.help.name}` + " queue del [numero]`` " +
									"para excluir um item da fila.**"));
							else {
								return message.channel.send(queue_embed
									.addField('\u200B', "**Não há itens adicionais na fila.**"));
							}
						} else {
							var queue_element = '';
							var largequeue_embed = new Discord.RichEmbed()
								.setAuthor(`Fila de ${message.guild.name}`, message.guild.iconURL)
								.addField('♪ Agora tocando', `**[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})** - ` +
									`${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)}`)
								.setColor('#00FF00');

							for (let i = 1; i < serverQueue.songs.length; i++) {
								queue_element += `${i} - **[${serverQueue.songs[i].title}](${serverQueue.songs[i].url})** ` +
									` - **${timing(serverQueue.songs[i].length)}** [<@${serverQueue.songs[i].authorID}>]\n`

								fulltime += parseInt(serverQueue.songs[i].length);
								if (i === serverQueue.songs.length - 1) largequeue_embed.addField('Próximos na fila', `${queue_element}`);
							}

							return message.channel.send(largequeue_embed.setFooter(`Tempo total da playlist: ${timing(fulltime)}`, bot.user.displayAvatarURL));
						}
					}
				} catch (e) {
					console.error(`${e} / Tried to call queue without a queue`);
					return message.channel.send(new Discord.RichEmbed().setDescription('**Não tem nada sendo tocado no momento.**')
						.setColor("#FF0000"));
				}
			}
		case "skip":
		case "s":
			{
				try {
					if (dispatcher.speaking) {
						var current_music = serverQueue.songs[0];
						await message.channel.send(new Discord.RichEmbed()
							.setDescription(`**${message.author.username}** pulou **[${current_music.title}](${current_music.url})**`)
							.setColor("#00FF00"));
						await dispatcher.end();
						return;
					} else {
						return message.channel.send(new Discord.RichEmbed()
							.setTitle("Não tem nada tocando que possa ser pulado.")
							.setColor("#FF0000"));
					}
				} catch (error) {
					return console.error('Tried to skip nothing');
				}
			}
		default:
			break;
	}
}

async function video_player(bot, message, video, serverQueue, voiceChannel, videosarray = []) {
	// Collect all the information from the 'video' variable
	var unavaliable_videos = 0;
	var song_info;
	var song_playlist = new Array();
	if (videosarray.length !== 0) {
		for (let v = 0; v < videosarray.length; v++) {
			try {
				song_info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videosarray[v].id}`);
			} catch (e) {
				console.log(`${e}: Video not available.`);
			}

			if (song_info) {
				song_playlist[v] = {
					id: videosarray[v].id,
					title: song_info.title,
					url: `https://www.youtube.com/watch?v=${videosarray[v].id}`,
					thumbnail: song_info.thumbnail_url,
					length: song_info.length_seconds,
					authorID: message.author.id,
					author: message.author,
					channel: song_info.author.name,
					channel_url: song_info.author.channel_url,
					media_artist: song_info.media.artist,
					media_album: song_info.media.album,
					media_writers: song_info.media.writers
				};

				video = videosarray[v];
			} else {
				console.log(`${e}: Error ocurred getting video information.`)
			}
		}
	}

	try {
		song_info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.id}`);
	} catch (e) {
		console.error(`${e}: [${message.author.username}] Tried to call song info with no song`);
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
		authorID: message.author.id,
		author: message.author,
		channel: song_info.author.name,
		channel_url: song_info.author.channel_url,
		media_artist: song_info.media.artist,
		media_album: song_info.media.album,
		media_writers: song_info.media.writers
	};

	leaving = false;
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			playing: true
		};

		queue.set(message.guild.id, queueConstruct);

		if (videosarray.length !== 0) {
			var playlist_length = 0;
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					playlist_length += parseInt(song_playlist[i].length);
					await queueConstruct.songs.push(song_playlist[i]);
				}
			}

			var pl_string = `**${videosarray.length}** videos foram adicionados à fila`;
			if (unavaliable_videos > 0) {
				pl_string += `, **${unavaliable_videos}** videos indisponíveis.`
			} else pl_string += '.';

			message.channel.send(new Discord.RichEmbed()
				.addField(pl_string, "Use ``" +
					`${botconfig.prefix}${module.exports.help.name} queue` + "`` para ver a fila completa.")
				.setColor('#00FF00')
				.setFooter(`Adicionado por ${message.author.username} - Total de ${timing(playlist_length)}`, message.author.displayAvatarURL));
		} else {
			await queueConstruct.songs.push(song);
		}

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;

			play(bot, message, message.guild, queueConstruct.songs[0]);

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
				await serverQueue.songs.push(song_playlist[i]);
			}

			return message.channel.send(new Discord.RichEmbed()
				.addField(`**${videosarray.length}** videos foram adicionados à fila.`, "Use ``" +
					`${botconfig.prefix}${module.exports.help.name} queue` + "`` para ver a fila completa.")
				.setColor('#00FF00')
				.setFooter(`Adicionado por ${message.author.username}`, message.author.displayAvatarURL));
		} else {
			serverQueue.songs.push(song);
			var isLivestream = `${timing(song.length)}`;
			if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

			return message.channel.send(new Discord.RichEmbed()
				.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
				.setDescription("``" + `[${botconfig.prefix}${module.exports.help.name} queue]` + "``" + ` para ver a fila completa.`)
				.addField("Foi adicionado à fila", `[${song.title}](${song.url})`)
				.addField(`Duração`, `${isLivestream}`, true)
				.addField(`Posição`, `${serverQueue.songs.length}`, true)
				.setThumbnail(song.thumbnail)
				.setFooter(`Adicionado por ${message.author.username}`, message.author.displayAvatarURL)
				.setColor("#00FF00")
				.setURL(song.url));
		}
	}
}

async function play(bot, message, guild, song) {
	var serverQueue = queue.get(guild.id);
	if (!leaving) {
		dispatcher = await serverQueue.connection.playStream(ytdl(song.url, {
			highWaterMark: 1024 * 1024 * 2, // 2MB Video Buffer
			quality: 'highestaudio'
		}));
	} else return;

	// message filtering for rich embed of 'now playing'
	var artist_str = `${song.media_artist}`;
	var album_str = `${song.media_album}`;
	var writers_str = `${song.media_writers}`;

	var isLivestream = `${timing(song.length)}`;
	if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

	// var repeat_string = ''
	// if (repeating) repeat_string = `${bot.user.username} Music Player Repetindo 🔁`;
	// else repeat_string = `${bot.user.username} Music Player`;

	var music_embed = new Discord.RichEmbed()
		.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`, true)
		.addField("Adicionado por", `[<@${song.authorID}>]`, true)
		.addField("Duração", `${isLivestream}`, true)
		.addField("Canal", `[${song.channel}](${song.channel_url})`, true)
		.addField("Canal de voz", `🔊 **${message.member.voiceChannel.name}**`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	if (serverQueue.songs.length > 1) music_embed.addField("Restantes na fila", `**${serverQueue.songs.length - 1}**`);

	if (artist_str !== 'undefined') music_embed.addField("Artista", `*${artist_str}*`, true);
	if (album_str !== 'undefined') music_embed.addField("Álbum", `*${album_str}*`, true);
	if (writers_str !== 'undefined') music_embed.addField("Escritores", `*${writers_str}*`, true);

	if (!jumped)
		await message.channel.send(music_embed);

	dispatcher.on('end', () => {
		//if (repeating) {
		//	play(bot, message, guild, serverQueue.songs[0]);
		//} else {
		if (serverQueue.songs.length === 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();

			if (!leaving) {
				message.channel.send(new Discord.RichEmbed()
					.setTitle("A fila de músicas acabou.")
					.setColor("#00FF00"));
			}
			return;
		}

		serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
		//}
	});


	dispatcher.on('error', error => console.error(`A error ocurred in the dispatcher: ${error}`));
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
	name_2: "m"
}