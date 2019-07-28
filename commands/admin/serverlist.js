const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  if (message.author.id === "244270921286811648") {
    let current_servers = bot.guilds.array();

    let guildstring = "";
    let membercount = 0;
    for (let i = 0; i < current_servers.length; i++) {
      let leftzero = "";
      if (i < 9) leftzero += "0";
      membercount += current_servers[i].memberCount;
      guildstring += `${leftzero}${i + 1} - [${current_servers[i]}] [${
        current_servers[i].memberCount
      } membros]\n`;
    }

    return message.channel.send(
      "```" +
        guildstring +
        `\nUm total de [${membercount}] usuários alcançados` +
        "```"
    );
  } else {
    return message.channel.send(
      new Discord.RichEmbed()
        .setDescription("Só **Fobenga** pode usar esse comando mals.")
        .setColor("#FF0000")
    );
  }
};

module.exports.help = {
  name: "serverlist"
};
