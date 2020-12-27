const Discord = require("discord.js");
const GeniusImport = require("genius-lyrics");
const helper = require.main.require('./core/helper.js');
const genius_key = helper.loadKeys("genius_key");
const genius = new GeniusImport.Client(genius_key);

module.exports.run = async (bot, message, args, serverQueue) => {
  // 1 - Get the current music playing with the serverQueue variable.
  if (!serverQueue) {
    return message.channel.send(new Discord.MessageEmbed()
      .setTitle("Uso incorreto do comando.")
      .setDescription("Não tem nada sendo tocado no momento.")
      .setColor("#FF0000"));
  }

  let currentsong_title = serverQueue.songs[0].title;
  const search_url = await genius.getUrl(currentsong_title);
  const lyricsJSON = await Genius.getLyrics(search_url);
  const lyrics = lyricsJSON.lyrics;
  console.log(lyrics);

  // 2 - Set the title of the song to the search query of the Node.JS package that handles lyrics.
  // 3 - Output the lyrics in a MessageEmbed().
};

module.exports.help = {
  name: "lyrics",
  protected: true
};