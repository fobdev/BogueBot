const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

	//var pages_embed = new Discord.RichEmbed()
	//	.setTitle('This is a embed.')
	//	.setColor("#00FF00");
	//
	//const react_controls = {
	//	NEXT: '▶',
	//	PREV: '◀'
	//}
	//
	//const react_collector = new Discord.ReactionCollector(message, (reaction, user) => Object.values(react_controls).includes(reaction.emoji.name))
	//
	//
	//react_collector.on('collect', (reaction, user) => {
	//	var page_number = 0;
	//	switch (reaction.emoji.name) {
	//		case emojis.NEXT:
	//			{
	//				page_number++;
	//				pages_embed.title = `Page ${page_number}`
	//			}
	//			break;
	//		case emojis.PREV:
	//			{
	//				page_number--;
	//				pages_embed.title = `Page ${page_number}`
	//			}
	//			break;
	//	}
	//})
	//
	//message.channel.send(pages_embed);
}

module.exports.help = {
	name: "test"
}