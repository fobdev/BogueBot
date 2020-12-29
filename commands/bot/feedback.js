const Discord = require("discord.js");
const botconfig = require.main.require("./botconfig.json");

module.exports.run = async (bot, message, args) => {
  let user_message = args.join(" ");

  if (!user_message)
    return message.channel.send(
      new Discord.MessageEmbed()
      .setTitle("Uso incorreto do comando")
      .setDescription(
        "Tente usar: ``" +
        `${botconfig.prefix}${this.help.name} [${this.help.arg}]` +
        "``"
      )
      .setColor("#FF0000")
    );

  // Get Fobenga [User] Object
  let fobenga;
  let uarr = message.client.users.cache.array();
  for (let i = 0; i < uarr.length; i++)
    if (uarr[i].id == 244270921286811648) fobenga = uarr[i];

  fobenga.send(
    new Discord.MessageEmbed()
    .setColor("#0000FF")
    .setTitle("A user sent a feedback message!")
    .setThumbnail(message.author.displayAvatarURL())
    .setDescription(user_message)
    .addField(
      "Sent by user:",
      `${message.author.username} (${message.author.tag})`
    )
    .addField("Sent from guild:", message.guild.name)
    .setFooter("Message sent")
    .setTimestamp(message.createdTimestamp)
  );

  return message.channel.send(
    new Discord.MessageEmbed()
    .setColor("#0000FF")
    .setTitle(`Uma mensagem de feedback foi enviada para ${fobenga.tag}`)
    .setThumbnail(message.author.displayAvatarURL())
    .setDescription(user_message)
    .addField(
      "Enviado por:",
      `${message.author.username} (${message.author.tag})`
    )
    .addField("Enviado do servidor:", message.guild.name)
    .setFooter("Enviada em")
    .setTimestamp(message.createdTimestamp)
  );
};

module.exports.help = {
  name: "feedback",
  descr: `Use este comando para enviar uma sugestão de comando para o administrador do bot.`,
  arg: ["mensagem"]
};