const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {



	// message.channel.send(embed_msg)
	// 	.then(msg => msg.react(':arrow_backward:'))
	// 	.then(m_react => m_react.react(':arrow_forward:'))
	// 	.then(m_react => {
	// 
	// 	})
	// 	.catch(console.error);

	var n = 0;
	const embed_msg = new Discord.RichEmbed()
		.setTitle("Rich Embed edit test")
		.setDescription(n)
		.setColor("#00FF00");

	const r_filter = (reaction, user) => reaction.emoji.name === '◀' || reaction.emoji.name === '▶';

	message.channel.send(embed_msg).then(left_arrow => left_arrow.react('◀')).then(right_arrow => right_arrow.message.react('▶'))
		.then(change => {
			const collector = change.message.createReactionCollector(r_filter);
			collector.on('collect', r => {
				n++;
				old_descr = embed_msg.description;

				const new_embed = new Discord.RichEmbed()
					.setTitle(embed_msg.title)
					.setColor(embed_msg.color)
					.setDescription(parseInt(n));

				r.message.edit(new_embed);
			})
		})

}

module.exports.help = {
	name: "test"
}