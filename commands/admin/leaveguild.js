const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  if (message.author.id === process.env.admin_id) {
    if (!args[1])
      return message.channel.send("Insira o ID de um servidor para sair.");
    else {
      try {
        let guild_promise = bot.guilds.fetch(args[1]);

        guild_promise
          .leave()
          .then(() =>
            message.channel.send(`O bot saiu do servidor ${guild_promise.name}`)
          );
      } catch (e) {
        console.error(e);
        return message.channel.send("ID inválido.");
      }
    }
  } else {
    return message.channel.send(
      new Discord.MessageEmbed()
        .setTitle("Permissões insuficientes")
        .setDescription(
          "Apenas o administrador do bot tem permissão de executar esse comando"
        )
        .setColor("#FF0000")
    );
  }
};

module.exports.help = {
  name: "leaveguild",
  descr: "Remove o bot de um servidor (apenas admin).",
  arg: ["array index do servidor"],
};
