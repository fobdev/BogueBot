const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	// const react_controls = {
	// 	NEXT: '▶',
	// 	PREV: '◀'
	// }
	// 
	// const reactionFilter = (reaction, user) => Object.values(react_controls).includes(reaction.emoji.name);
	// 
	// const init_embed = new Discord.RichEmbed()
	// 	.setTitle('This embed will be edited')
	// 	.setDescription('THIS WILL CHANGE: ')
	// 	.setColor('#00FF00');
	// 
	// // add reaction emoji to message
	// message.channel.send(init_embed)
	// 	.then(msg => msg.react('◀'))
	// 	.then(mReaction => mReaction.message.react('▶'))
	// 	.then(mReaction => {
	// 		const collector = mReaction.message
	// 			.createReactionCollector(reactionFilter)
	// 
	// 		var number = 0;
	// 		collector.on('collect', r => {
	// 
	// 			if (r.emoji.name === react_controls.NEXT) {
	// 				number++;
	// 				console.log(number);
	// 			} else {
	// 				number--
	// 				console.log(number);
	// 			}
	// 
	// 			let descript = init_embed.description;
	// 			descript = `NUMBER: ${number}`;
	// 
	// 			const new_embed = new Discord.RichEmbed()
	// 				.setTitle(init_embed.title)
	// 				.setDescription(descript);
	// 
	// 			r.message.edit(new_embed);
	// 		});
	// 	})
	// 
}

module.exports.help = {
	name: "test"
}