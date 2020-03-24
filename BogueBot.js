const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const helper = require("./core/helper");
const fs = require("fs");
const numeral = require("numeral");
let cmd_counter = 0;
let bot_token = helper.loadKeys("token");

const bot = new Discord.Client({
  disableEveryone: true
});

bot.commands = new Discord.Collection();

function cmdload(folder) {
  let path = "./commands/" + folder + "/";
  let type = path.split("./commands").pop();

  fs.readdir(path, (err, files) => {
    if (err)
      return console.error(
        `\n=====\nThe directory ${path.toLowerCase()} does not exist.\n=====`
      );

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length < 1) throw new Error("Could not find commands.");

    console.log(`\n=== Loading ${type.toLowerCase()} ===`);
    jsfile.forEach(f => {
      let props = require(path + f);
      console.log(`[FILE LOAD SUCESS]: ${f}`);

      if (props.help.name) bot.commands.set(props.help.name, props);
      else
        console.warn(
          "[WARNING]: Commands with no name are impossible to call."
        );

      if (props.help.name_2) bot.commands.set(props.help.name_2, props);
      if (props.help.name_3) bot.commands.set(props.help.name_3, props);
      if (props.help.name_4) bot.commands.set(props.help.name_4, props);
    });
  });
}

cmdload("admin");
cmdload("bot");
cmdload("user");
cmdload("fun");
cmdload("music");
cmdload("games");

function servers_show() {
  let current_servers = bot.guilds.array();
  let members_reached = 0;
  console.log("--------------------------------------------");
  console.log(
    `Connected to [${current_servers.length}] servers.\nServer List:`
  );

  // Get the name of all the servers
  for (let i = 0; i < current_servers.length; i++) {
    let leftzero = "";
    if (i < 9) leftzero += "0";
    members_reached += current_servers[i].memberCount;
    console.log(
      `${leftzero}${i + 1} - [${current_servers[i]}] [${
        current_servers[i].memberCount
      } members]`
    );
  }
  console.log("--------------------------------------------");
  console.log(`A total of [${members_reached}] Discord users reached.`);
  console.log("--------------------------------------------");
}

function status_updater() {
  let current_servers = bot.guilds.array();
  let members_reached = 0;

  for (let i = 0; i < current_servers.length; i++)
    members_reached += current_servers[i].memberCount;

  let cmd_plural = "comando usado hoje.";
  if (cmd_counter !== 1) cmd_plural = "comandos usados hoje.";

  const helpfile = require("./commands/bot/help.js");
  const invitefile = require("./commands/bot/invite.js");
  // bot.user.setStatus("dnd");
  // bot.user.setActivity(`bila me programar.`, {
  //     type: 'WATCHING'
  // });

  bot.user.setActivity(
    `${botconfig.prefix}${helpfile.help.name} | ${botconfig.prefix}${
      invitefile.help.name
    }` +
    ` | ${numeral(members_reached).format()} usuários | ${
        current_servers.length
      } servidores | ${cmd_counter} ${cmd_plural}`, {
      type: "PLAYING"
    }
  );
}

bot.on("ready", async () => {
  console.log("\n---------------------------------");
  console.log(`${bot.user.username} is online!`);
  servers_show();
  status_updater();
  return;
});

bot.on("guildCreate", guild => {
  const help_file = require("./commands/bot/help.js");
  const music_file = require("./commands/music/music.js");
  const welcome_embed = new Discord.RichEmbed()
    .setColor("#00FF00")
    .setAuthor(
      `Obrigado por adicionar o ${bot.user.username} ao servidor ${guild.name}!`,
      bot.user.displayAvatarURL
    )
    .addBlankField()
    .setDescription(
      `**${botconfig.prefix}${
        help_file.help.name
      }** para todas os comandos disponíveis.\n`
    )
    .addField(
      `Use o prefixo '${botconfig.prefix}' para se comunicar comigo.`,
      `**${botconfig.prefix}${
        music_file.help.name
      }** para usar os comandos de música\n` +
      `Ou **${botconfig.prefix}${help_file.help.name} ${
          music_file.help.name
        }** para ajuda sobre os comandos de música.`
    )
    .addBlankField()
    .setFooter("Você é um administrador deste servidor, por isso recebeu esta mesagem. \n" +
      "Bot criado por Bila, em ")
    .setTimestamp(bot.user.createdAt);

  const bots_channel = guild.channels.find(ch => ch.name === "bots");
  const music_channel = guild.channels.find(ch => ch.name === "music");

  if (bots_channel && bots_channel.type === "text") {
    bots_channel.send(welcome_embed);
    console.log("Welcome message sent at 'bots' channel.");
  } else {
    console.log("No channel named 'bots' found in this server.");
  }

  if (music_channel && music_channel.type === "text") {
    music_channel.send(welcome_embed);
    console.log("Welcome message sent at 'music' channel.");
  } else {
    console.log("No channel named 'music' found in this server.");
  }

  console.log("---------------------------------");
  console.log(`${bot.user.username} joined server [${guild.name}].`);
  servers_show();

  const system_channel = guild.channels.find(
    ch => ch.id === guild.systemChannelID
  );
  if (system_channel) {
    system_channel.send(welcome_embed);
    console.log("Welcome message sent to system channel.");
  } else {
    console.log("No System Channel Available");
  }

  status_updater();
});

bot.on("guildDelete", guild => {
  servers_show();
  status_updater();
  return console.log(
    `>>${bot.user.username} was removed from server [${guild.name}].`
  );
});

bot.on("guildMemberRemove", member => {
  const system_channel = member.guild.channels.find(
    ch => ch.id === member.guild.systemChannelID
  );
  if (system_channel) {
    if (member.guild.member(bot.user).hasPermission("ADMINISTRATOR")) {
      system_channel.send(`${member} (**${member.user.tag}**) saiu.`);
      console.log(
        `[MEMBER LEAVE] member [${
          member.user.username
        }] leave message successfully sent to ${
          member.guild.name
        } system channel.`
      );
    }
  }
});

bot.on("message", async message => {
  if (message.content.includes('bog') &&
    !message.content.includes('help') &&
    !message.content.includes('prime') &&
    !message.content.includes('pixel') &&
    !message.content.includes('bogue')) {
    // randomizes a set of messages that the bot can send
    let answers = ['bog.png', 'bog2.png', 'iae', 'salve', 'tmj', 'oi', 'ói',
      'fala', 'bog', 'bila', 'José', 'TMJ',
      '?', '?????', 'fdp', 'oiiiii', 'me deixa em paz', 'mattos b',
      'slv', 'oq voce quer', 'me esquece', 'oie', 'kkkk',
      'me chamou', 'quem e vc', 'me deixa', 'vou me suicidar', 'pq',
      'tamo juntó', 'vó', 'VÓ', 'porque', 'para de me chamar por favor', 'nao tenho nada pra voce',
      'qual a sua', 'k', 'mae puta', 'oi gente', 'IAE', 'eu mesmo como descobriu'
    ];
    let rng = Math.floor(Math.random() * answers.length);
    console.log(`[Passive Mention]: [${message.author.username}] said [${message.content}] @ [${message.guild.name}], bot: [${answers[rng]}].`);

    switch (rng) {
      case 0: {
        let bog_att = new Discord.Attachment('bog.png');
        await message.channel.send(new Discord.RichEmbed()
          .setTitle(`Eu mesmo como como descobriu.`)
          .attachFile(bog_att)
          .setImage(`attachment://${'bog.png'}`)
          .setColor("#00FF00"));
      }
      break;
    case 1: {
      let bog2_att = new Discord.Attachment('bog2.png');
      await message.channel.send(new Discord.RichEmbed()
        .attachFile(bog2_att)
        .setImage(`attachment://${'bog2.png'}`)
        .setColor("#00FF00"));
    }
    break;
    default:
      return message.channel.send(answers[rng]);
    }
  }

  if (message.author.id === bot.user.id) {
    cmd_counter++;
    status_updater();
  }

  if (message.channel.type === "dm") {
    if (message.author.id === bot.user.id) return;
    else {
      console.log(
        `[${message.author.username}] Direct Message: ${message.content}`
      );
      return bot.generateInvite(8).then(link => {
        message.channel.send(
          new Discord.RichEmbed()
          .setTitle(`O ${bot.user.username} funciona apenas em servidores.`)
          .setDescription(
            `Use esse convite para adiciona-lo ao seu servidor:
                **${link}**`
          )
          .setColor("#FFFFFF")
        );
      });
    }
  }

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let args = messageArray.slice(1);
  let cmd = messageArray[0];
  let command_file = bot.commands.get(cmd.slice(prefix.length));

  if (cmd[0] === prefix) {
    if (command_file) {
      console.log(
        `\nUser [${message.author.username}] sent [${message}]\nserver: [${
          message.guild.name
        }]\nchannel: #${message.channel.name}`
      );
      try {
        command_file.run(bot, message, args);
      } catch (e) {
        console.error(
          `${e}: 'run' function not found in file [${command_file}].`
        );
      }
    }
  }
});

bot.login(bot_token);