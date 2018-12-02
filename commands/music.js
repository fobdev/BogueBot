const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const botconfig = require.main.require("./botconfig.json");
const helper = require.main.require('./core/helper.js');

var ytkey = helper.loadKeys("youtube_key");

const queue = new Map();
const youtube = new YouTube(ytkey);
var dispatcher;

var subcommands = ['earrape', 'p', 'pause', 'leave', 'l', 'np', 'queue', 'q', 'skip', 's'];
var video;
var videos;
var url;
var isPlaylist;

module.exports.run = async (bot, message, args) => {
	if (!args[0]) {
		return message.channel.send('>help music').then(msg => {
			try {
				msg.delete();
			} catch (e) {
				console.error(`${message.guild.name} [self-message]: Could not delete self message.`);
			}
		})
	}

	const voiceChannel = message.member.voiceChannel;
	var serverQueue = queue.get(message.guild.id);
	url = args[0];
	isPlaylist = url.includes('list=');
	var search = args.join(" ");

	if (!voiceChannel) {
		return message.channel.send(new Discord.RichEmbed()
			.setTitle("Você precisa estar em um canal de voz para usar os comandos de música.")
			.setColor("FF0000"));
	}

	// Playlist support
	if (isPlaylist) {
		try {
			const playlist = await youtube.getPlaylist(url);
			const videosarray = await playlist.getVideos();

			if (videosarray) {
				message.channel.send(new Discord.RichEmbed()
					.setDescription(`Carregando **${videosarray.length}** videos da playlist **[${playlist.title}](${playlist.url})** de **[${playlist.channelTitle}](${playlist.channel.url})**...`)
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
		case "earrape":
			{
				if (dispatcher.speaking) {
					var sv_volume = serverQueue.connection.dispatcher.volume;
					if (sv_volume !== 1) serverQueue.connection.dispatcher.setVolume(1);

					if (sv_volume === 1) {
						serverQueue.connection.dispatcher.setVolume(200);
						return message.channel.send(new Discord.RichEmbed()
							.setDescription(`**<@${message.author.id}> ativou earrape.**`)
							.setColor("#00FF00"));
					} else if (sv_volume === 200) {
						serverQueue.connection.dispatcher.setVolume(1);
						return message.channel.send(arg_embed
							.setDescription(`**O volume voltou ao normal.**`)
							.setColor("#00FF00"));
					} else {
						return message.channel.send(new Discord.RichEmbed()
							.setDescription(`Ocorreu um erro ao usar este comando.`)
							.setColor("#FF0000"));
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
				if (serverQueue) {
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
						.setDescription('Não tem nada na fila de músicas.')
						.setColor("#FF0000"));
				}
			}
		case "leave":
		case "l":
			{
				try {
					await serverQueue.voiceChannel.leave();
					await queue.delete(guild.id);
					console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);
					return message.channel.send(new Discord.RichEmbed()
						.setDescription(`Saí do canal de voz **${serverQueue.voiceChannel}** e apaguei minha fila.`)
						.setColor("#00FF00"));
				} catch (e) {
					console.error("Error ocurred when leaving the voice channel");
					console.error(`Error: ${e}`)
					return message.channel.send(arg_embed
						.setTitle("Ocorreu um erro ao sair da sala.")
						.setColor("#FF0000"));
				}
			}
		case "np":
			{
				try {
					var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);
				} catch (e) {
					console.error(`NP error: ${e}`);
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
					.setAuthor(`${bot.user.username} Now Playing`, bot.user.displayAvatarURL)
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
				try {
					function swap(e1, e2, a) {
						var t = a[e1];
						a[e1] = a[e2];
						a[e2] = t;
					}

					if (args[1] === 'shuffle') {
						for (let i = 1; i < serverQueue.songs.length; i++) {
							var rand_pos = Math.floor((Math.random() * i) + 1);
							swap(i, rand_pos, serverQueue.songs);
						}

						return message.channel.send(new Discord.RichEmbed()
							.setColor('#00FF00')
							.setTitle(`**${message.author.username}** randomizou a fila de **${message.guild.name}**`)
							.setDescription("``" + `${botconfig.prefix}${module.exports.help.name_2} q` + "`` para ver a fila completa."));
					}

					if (args[1] === 'next' && args[2]) {
						try {
							var swappable = parseInt(args[2]);
						} catch (e) {
							console.error(`${e}: invalid input in 'swap' command.`)
							return message.channel.send(new Discord.RichEmbed()
								.setTitle('Uso incorreto do comando')
								.setDescription("``" + `${botconfig.prefix}${module.exports.help.name} queue position [numero1]` + "``" +
									" para colocar [numero1] como próximo video a se reproduzir.")
								.setColor('#FF0000'));
						}

						if (swappable < 2 || swappable > serverQueue.songs.length) {
							return message.channel.send(new Discord.RichEmbed()
								.setTitle('Uso incorreto do comando')
								.setDescription(`Use apenas valores entre **2** e **${serverQueue.songs.length - 1}**`)
								.setColor("#FF0000"));
						}

						// Puts a copy of the desired video in the beginning of the array at > 0
						serverQueue.songs.splice(1, 0, serverQueue.songs[swappable]);
						// Deletes the original video in the array 
						serverQueue.songs.splice(swappable + 1, 1);

						return message.channel.send(new Discord.RichEmbed()
							.setDescription(`:arrow_up: **[${serverQueue.songs[1].title}](${serverQueue.songs[1].url})** reproduzindo a seguir.`)
							.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
							.setColor("#00FF00"));
					}

					if (args[1] === 'pos' || args[1] === 'position') {
						if (args[2] && args[3]) {
							try {
								var swappable_e1 = parseInt(args[2]);
								var swappable_e2 = parseInt(args[3]);
							} catch (e) {
								console.error(`${e}: invalid input in 'swap' command.`)
								return message.channel.send(new Discord.RichEmbed()
									.setTitle('Uso incorreto do comando')
									.setDescription("``" + `${botconfig.prefix}${module.exports.help.name} queue position [numero1] [numero2]` + "``" +
										" alterna a posição de dois vídeos na fila.")
									.setColor('#FF0000'));
							}

							if (swappable_e1 < 1 ||
								swappable_e1 > serverQueue.songs.length ||
								swappable_e2 < 1 ||
								swappable_e2 > serverQueue.songs.length) {
								return message.channel.send(new Discord.RichEmbed()
									.setTitle('Uso incorreto do comando')
									.setDescription(`Use apenas valores entre **1** e **${serverQueue.songs.length - 1}**`)
									.setColor("#FF0000"));
							}

							if (swappable_e1 === swappable_e2) {
								return message.channel.send(new Discord.RichEmbed()
									.setDescription('Você deve escolher posições diferentes.')
									.setColor("#FF0000"));
							}


							var first_arrow = '';
							var second_arrow = '';
							if (swappable_e1 < swappable_e2) {
								first_arrow = ':arrow_up:';
								second_arrow = ':arrow_down:';
							} else {
								first_arrow = ':arrow_down:';
								second_arrow = ':arrow_up:';
							}

							swap(swappable_e1, swappable_e2, serverQueue.songs);
							return message.channel.send(new Discord.RichEmbed()
								.setTitle(`Posição de vídeos alternadas`)
								.setDescription(`**${first_arrow} [${serverQueue.songs[swappable_e1].title}](${serverQueue.songs[swappable_e1].url})**\n` +
									`**${second_arrow} [${serverQueue.songs[swappable_e2].title}](${serverQueue.songs[swappable_e2].url})**`)
								.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
								.setColor("#00FF00"));

						} else {
							return message.channel.send(new Discord.RichEmbed()
								.setTitle('Uso incorreto do comando')
								.setDescription("``" + `${botconfig.prefix}${module.exports.help.name} queue position [numero1] [numero2]` + "``" +
									" alterna a posição de dois vídeos na fila.")
								.setColor('#FF0000'));
						}
					}

					if (args[1] === 'delete' || args[1] === 'del') {
						if (!args[3]) {
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
						} else {
							var start = parseInt(args[2]);
							var end = parseInt(args[3]);
							var amount = start - end;
							if (amount < 0) amount *= -1;
							if (amount === 0) return message.channel.send(new Discord.RichEmbed()
								.setDescription('Os valores precisam ser **diferentes**.')
								.setColor('#FF0000'));

							if (start > 0 && end <= serverQueue.songs.length) {
								var deleted_entries = await serverQueue.songs.splice(start, amount + 1);
								return message.channel.send(arg_embed
									.setDescription(`Foram removidos **${deleted_entries.length}** vídeos da fila de **${message.guild.name}**`)
									.setColor("#00FF00"));

							} else return message.channel.send(new Discord.RichEmbed()
								.setDescription(`Você deve colocar valores entre **1** e **${serverQueue.songs.length}**`)
								.setColor('#FF0000'));
						}
					}

					if (args[1] === 'purge' || args[1] === 'pg') {
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
							serverQueue.songs.splice(0, parseInt(args[1] - 1));

							dispatcher.end();
							return message.channel.send(arg_embed
								.setTitle(`Fila pulada para a posição **${args[1]}**`)
								.setDescription("``" + `${botconfig.prefix}${module.exports.help.name_2} q` + "`` para ver a nova fila.")
								.setFooter(`Chamado por ${message.author.username}`, message.author.displayAvatarURL)
								.setColor("#00FF00"));
						} else {
							return message.channel.send(arg_embed
								.setDescription(`**Use um valor que seja entre 1 e ${serverQueue.songs.length - 1}**`)
								.setColor("#FF0000"));
						}
					} else {
						var dispatchertime_seconds = Math.floor(dispatcher.time / 1000);

						// Tries to print the normal queue
						try {

							var queue_len = 0;
							var ultralarge_queue = '';
							var dispatchertime_seconds = parseInt(Math.floor(dispatcher.time / 1000));

							const page_size = 15
							var page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));
							var current_page = 0;

							for (let i = 0; i < serverQueue.songs.length; i++) {
								queue_len += parseInt(serverQueue.songs[i].length);
							}

							for (let i = 1; i <= page_size; i++) {
								// Whitespace for padding of numbers
								var whitespace = ' ';
								if (i < 10) whitespace = "  ";
								else whitespace = " ";

								try {
									ultralarge_queue += `${i}.${whitespace}${serverQueue.songs[i].title} <${serverQueue.songs[i].author.username}> | < ${timing(serverQueue.songs[i].length)} >\n`;
								} catch (e) {
									continue;
								}
							}

							var queue_header = "```md\n" +
								`Fila de ${message.guild.name} | Página ( ${current_page + 1} / ${page_amount} )
========================================================================
Agora Tocando: [${serverQueue.songs[0].title}](${timing(dispatchertime_seconds)} / ${timing(serverQueue.songs[0].length)})

`;;
							var queue_content = `${ultralarge_queue}`;

							var queue_footer = `
Tempo total da fila: [${timing(queue_len)}] | [${serverQueue.songs.length}] vídeos.
------------------------------------------------------------------------` + "```";

							var queue_nav_help = "```" + `
Use '<' ou '>' para navegar pelas páginas da fila.` + "```";

							var full_queue = queue_header + queue_content + queue_footer;
							if (serverQueue.songs.length - 1 > page_size) full_queue += queue_nav_help;

							var botmessage_collector = new Discord.MessageCollector(message.channel, m => m.author.id === bot.user.id, {
								time: 1000 * 60
							});
							var usermessage_navigator = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
								time: 1000 * 60
							});

							function new_header_f(current_page, page_amount, songs_array) {
								var page_str = '';
								if (page_amount > 1) page_str = `Página ( ${current_page + 1} / ${page_amount} )`
								var new_header = "```md\n" +
									`Fila de ${message.guild.name} | ${page_str}
========================================================================
Agora Tocando: [${songs_array[0].title}](${timing(parseInt(Math.floor(dispatcher.time / 1000)))} / ${timing(songs_array[0].length)})

`;

								return new_header;
							}

							function new_content_f(current_page, songs_array) {
								var new_content = '';
								for (let i = (page_size * current_page) + 1; i <= (page_size * current_page) + page_size; i++) {
									// Whitespace for padding of numbers
									var whitespace = ' ';
									if (i < 10) whitespace = "  ";
									else whitespace = " ";

									/*
									Try to print the max amount, if the max amount isn't available in the current page
									print only the available, continue after catch the error
									*/
									try {
										new_content += `${i}.${whitespace}${songs_array[i].title} <${songs_array[i].author.username}> | < ${timing(songs_array[i].length)} >\n`;
									} catch (e) {
										continue;
									}
								}
								return new_content;
							}

							function new_footer_f(song_array) {
								var new_length = 0
								for (let i = 0; i < song_array.length; i++) {
									new_length += parseInt(song_array[i].length);
								}

								var new_footer = `
Tempo total da fila: [${timing(new_length)}] | [${song_array.length}] vídeos.
------------------------------------------------------------------------` + "```";

								return new_footer;
							}

							// Update the queue message everytime a bot message is received.
							botmessage_collector.on('collect', () => {
								var new_page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));

								if (new_content_f(current_page, serverQueue.songs).length === 0) current_page = 0;

								var dynamic_update = '';
								if (page_amount > 1) {
									dynamic_update += new_header_f(current_page, new_page_amount, serverQueue.songs) +
										new_content_f(current_page, serverQueue.songs) +
										new_footer_f(serverQueue.songs) + queue_nav_help;
								} else {
									dynamic_update += new_header_f(current_page, new_page_amount, serverQueue.songs) +
										new_content_f(current_page, serverQueue.songs) +
										new_footer_f(serverQueue.songs);
								}

								botmessage_collector.collected.array()[0].edit(dynamic_update);
							});

							if (page_amount > 1) {
								message.channel.send(full_queue);
								usermessage_navigator.on('collect', async (msg) => {
									if (msg.content === '>' || msg.content === '<') {
										var new_page_amount = Math.ceil(((serverQueue.songs.length - 1) / page_size));

										try {
											await msg.delete();
										} catch (e) {
											console.error(`${message.guild.name} [queue]: ${e}.`);
										}

										if (msg.content === '>') current_page++;
										if (msg.content === '<') current_page--;
										if (current_page < 0) current_page = new_page_amount - 1;
										if (current_page >= new_page_amount) current_page = 0;

										var new_page = new_header_f(current_page, new_page_amount, serverQueue.songs) +
											new_content_f(current_page, serverQueue.songs) +
											new_footer_f(serverQueue.songs) + queue_nav_help;

										botmessage_collector.collected.array()[0].edit(new_page);
									} else {
										usermessage_navigator.stop('forced');
										botmessage_collector.stop('forced');
									}
								});

								usermessage_navigator.on('end', (msg, reason) => {
									var new_navhelp = '';

									if (reason === 'forced') {
										new_navhelp += "```Interação cancelada, peça uma nova fila para continuar.```";
									} else {
										new_navhelp += "```O tempo de navegação expirou```";
									}

									// Go back to the first page.
									var final_page = new_header_f(0, Math.ceil(((serverQueue.songs.length - 1) / page_size)), serverQueue.songs) +
										new_content_f(0, serverQueue.songs) +
										new_footer_f(serverQueue.songs) + new_navhelp;

									botmessage_collector.collected.array()[0].edit(final_page)
								})
							} else {
								message.channel.send(full_queue);
							}
							return;
						} catch (e) {
							console.error(e);
							if (e != TypeError) {
								console.error(e);
								return message.channel.send(new Discord.RichEmbed()
									.setDescription('Não tem filas criadas neste servidor.')
									.setColor("#FF0000"));
							}

							return console.error(`${e}: Error printing queue list`);
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
						await dispatcher.end();
						await message.channel.send(new Discord.RichEmbed()
							.setDescription(`**${message.author.username}** pulou **[${current_music.title}](${current_music.url})**`)
							.setColor("#00FF00"));
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
	var unavailable_videos = 0;
	var song_info;
	var song_playlist = new Array();

	if (videosarray.length !== 0) {
		for (let v = 0; v < videosarray.length; v++) {
			try {
				song_info = await youtube.getVideoByID(videosarray[v].id);

				var tbnl = '';
				try {
					tbnl = song_info.thumbnails.maxres.url
				} catch (e) {
					try {
						tbnl = song_info.thumbnails.standard.url
					} catch (e) {
						try {
							tbnl = song_info.thumbnails.high.url
						} catch (e) {
							try {
								tbnl = song_info.thumbnails.medium.url
							} catch (e) {
								try {
									tbnl = song_info.thumbnails.default.url
								} catch (e) {
									console.error('no thumbnail available');
								}
							}
						}
					}
				}

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

				const error_lim = 4
				if (unavailable_videos < error_lim) {
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

	var tbnl = '';
	try {
		tbnl = song_info.thumbnails.maxres.url
	} catch (e) {
		try {
			tbnl = song_info.thumbnails.standard.url
		} catch (e) {
			try {
				tbnl = song_info.thumbnails.high.url
			} catch (e) {
				try {
					tbnl = song_info.thumbnails.medium.url
				} catch (e) {
					try {
						tbnl = song_info.thumbnails.default.url
					} catch (e) {
						console.error('no thumbnail available');
					}
				}
			}
		}
	}

	try {
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
			var playlist_length = 0;
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					playlist_length += parseInt(song_playlist[i].length);
					await queueConstruct.songs.push(song_playlist[i]);
				}
			}

			var pl_string = `**${videosarray.length - unavailable_videos}** videos foram adicionados à fila`;
			if (unavailable_videos > 0) {
				pl_string += `, **${unavailable_videos}** videos indisponíveis.`
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
			var playlist_length = 0;
			for (let i = 0; i < videosarray.length; i++) {
				if (song_playlist[i]) {
					playlist_length += parseInt(song_playlist[i].length);
					await serverQueue.songs.push(song_playlist[i]);
				}
			}

			var pl_string = `**${videosarray.length - unavailable_videos}** videos foram adicionados à fila`;
			if (unavailable_videos > 0) {
				pl_string += `, **${unavailable_videos}** videos indisponíveis.`
			} else pl_string += '.';

			return message.channel.send(new Discord.RichEmbed()
				.addField(pl_string, "Use ``" +
					`${botconfig.prefix}${module.exports.help.name} queue` + "`` para ver a fila completa.")
				.setColor('#00FF00')
				.setFooter(`Adicionado por ${message.author.username} - Total de ${timing(playlist_length)}`, message.author.displayAvatarURL));
		} else {
			serverQueue.songs.push(song);
			var isLivestream = `${timing(song.length)}`;
			if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

			return message.channel.send(new Discord.RichEmbed()
				.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
				.addField("Foi adicionado à fila", `**[${song.title}](${song.url})**`)
				.addField(`Duração`, `${isLivestream}`, true)
				.addField(`Posição`, `${serverQueue.songs.length - 1}`, true)
				.addField('\u200B', "``" + `[${botconfig.prefix}${module.exports.help.name_2} q]` + "`` para ver a fila completa.\n" +
					"``[" + `${botconfig.prefix}${module.exports.help.name_2} q next ${serverQueue.songs.length - 1}]` + "`` para tocar este video a seguir.")
				.setThumbnail(song.thumbnail)
				.setFooter(`Adicionado por ${message.author.username}`, message.author.displayAvatarURL)
				.setColor("#00FF00")
				.setURL(song.url));
		}
	}
}

async function play(bot, message, guild, song) {
	var serverQueue = queue.get(guild.id);
	dispatcher = await serverQueue.connection.playStream(ytdl(song.url, {
		highWaterMark: 1024 * 1024 * 2, // 2MB Video Buffer
		quality: 'highestaudio',
		filter: 'audioonly'
	}));

	var isLivestream = `${timing(song.length)}`;
	if (parseInt(song.length) === 0) isLivestream = '**🔴 Livestream**';

	var music_embed = new Discord.RichEmbed()
		.setAuthor(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
		.addField("♪ Agora tocando", `**[${song.title}](${song.url})**`, true)
		.setThumbnail(song.thumbnail)
		.setColor("#00FF00");

	if (serverQueue.songs.length > 1) music_embed.addField("Restantes na fila", `**${serverQueue.songs.length - 1}**`, true);

	music_embed
		.addField("Adicionado por", `[<@${song.authorID}>]`, true)
		.addField("Duração", `${isLivestream}`, true);

	message.channel.send(music_embed);

	dispatcher.on('end', () => {
		if (serverQueue.songs.length <= 1) {
			queue.delete(guild.id);
			serverQueue.voiceChannel.leave();
			console.log(`[STREAM] Stream from ${serverQueue.guildname} has finished.`);
			return message.channel.send(new Discord.RichEmbed()
				.setTitle(`Todos os vídeos da fila de **${message.guild.name}** foram reproduzidos, saindo do canal de voz.`)
				.setFooter(`${bot.user.username} Music Player`, bot.user.displayAvatarURL)
				.setColor("#00FF00"));
		}
		await serverQueue.songs.shift();
		play(bot, message, guild, serverQueue.songs[0]);
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
	name_2: "m",
	name_3: "play",
	name_4: "p"
}