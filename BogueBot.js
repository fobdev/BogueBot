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
  let current_servers = bot.guilds.cache.array();
  let members_reached = 0;
  let overload_count = 0;
  console.log("--------------------------------------------");
  console.log(`Connected to [${current_servers.length}] servers.\nServer List:`);

  // Get the name of all the servers
  for (let i = 0; i < current_servers.length; i++) {
    let leftzero = "";
    if (i < 9) leftzero += "0";
    members_reached += current_servers[i].memberCount;

    let logstring = `${leftzero}${i + 1} - [${current_servers[i]}] [${current_servers[i].memberCount} members]`;

    if (current_servers[i].memberCount >= 10000) {
      logstring += ' (user overload)';
      overload_count += current_servers[i].memberCount;
    }

    console.log(logstring);
  }

  console.log("--------------------------------------------");
  console.log(`A total of [${members_reached}] users reached | [${members_reached - overload_count}] with non-overload guilds (below 10k users).`);
  console.log("--------------------------------------------");
}

function status_updater() {
  let current_servers = bot.guilds.cache.array();
  let members_reached = 0;

  for (let i = 0; i < current_servers.length; i++)
    members_reached += current_servers[i].memberCount;

  let cmd_plural = "comando usado hoje.";
  if (cmd_counter !== 1) cmd_plural = "comandos usados hoje.";

  const helpfile = require("./commands/bot/help.js");
  const invitefile = require("./commands/bot/invite.js");

  bot.user.setActivity(
    `${botconfig.prefix}${helpfile.help.name} | ${botconfig.prefix}${
      invitefile.help.name
    }` +
    ` | ${numeral(members_reached).format()} membros | ${cmd_counter} ${cmd_plural}`, {
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
  // Get Fobenga [User] Object
  let fobenga;
  let uarr = message.client.users.cache.array();
  for (let i = 0; i < uarr.length; i++)
    if (uarr[i].id == 244270921286811648) fobenga = uarr[i];

  const help_file = require("./commands/bot/help.js");
  const music_file = require("./commands/music/music.js");
  const welcome_embed = new Discord.MessageEmbed()
    .setColor("#00FF00")
    .setAuthor(
      `Obrigado por adicionar o ${bot.user.username} ao servidor ${guild.name}!`,
      bot.user.displayAvatarURL()
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
      `Bot criado por ${fobenga.tag}, em `)
    .setTimestamp(bot.user.createdAt);

  const bots_channel = guild.channels.cache.find(ch => ch.name === "bots");
  const music_channel = guild.channels.cache.find(ch => ch.name === "music");

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
  const system_channel = member.guild.channels.cache.find(
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
  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ").toLowerCase();
  let args = messageArray.slice(1);
  let cmd = messageArray[0];
  let command_file = bot.commands.get(cmd.slice(prefix.length));

  let bogcheck = message.content.toLowerCase();
  if (bogcheck.includes('bog') && !message.content.includes(prefix)) {
    // randomizes a set of messages that the bot can send
    let answers = ['bog_img', 'iae', 'salve', 'tmj', 'oi', 'ói',
      'fala', 'bog', 'bila', 'José', 'TMJ', 'pfv me deixa em paz cara todo dia isso meu deus do ceu',
      '?', '??w???', 'markov fdp', 'aaah vamo nessa!', '01100010 01101001 01101100 01100001', 'fdp', 'oiiiii', 'me deixa em paz', 'mattos b',
      'sauve', 'oq voce quer', 'me esquece', 'oie', 'kkkk', 'pppppppppppppppppppppppppppppppp', 'setembro',
      'me chamou.. .w. .w. w..aaaaaaaaaaaaaa44444aaaaaaa', 'quem e vc', 'me deixa', 'vou te suicidar', 'pq',
      'tamo juntó', 'vó', 'VÓ', 'porque', 'me deixa em paz?', 'nao tenho nada pra voce',
      'qual a sua', 'kk', 'mae puta', 'oi gente', 'hum', 'obrigada', 'w', 'ȃ̸̦̩̦̙̓̌̍̉̈́̀͋̋̒̾͜͠ͅ ̸̨̢̨͖͚̝̩̼̓͑̈́̽̎p̴̼̝̀̃̓̉̽̊͝ọ̶̞̞͕̇̽̿̇̔͂̇r̵̞̞͔̿̓́́̓̎̄̅̈́̐̍͂̚͝͝r̴̜̼͈̼̗̣̗̦̰͔̱͐͒̇́͐̾̌̍̌̚̚͠å̴͎̗̤̩̩̼̮̅̃̐̓̍̌̎̀̐̕͜͜ ̴̡̡̨͙͉̖̞̭͖̥̱͇͇̯͖̾̊͂͊͝d̸͕̝͈͖̭̪̦̘̙̮̰̹̃̃̾̌̔͑̐̈́̕͘͠e̴̛̩̮̥̹̳͖͖̊̈́̒̚͠ ̵̡͎͍̪̭̗̙̯̞̳́̿̌̇̒͂̚̚u̶̗̺͌̏̿̑̅́̐̿̂͘͠͠m̵̯̓̓̄̃̎̾̓ ̸̧̡̛͙̰̱̝͔̩̜̯̺͍̳̅̋̾͆͌̏͊͌̀͆̔b̶̧͇̰͍́o̸̖̞̣̭̮̜͉̼̯͗̇̑̎̎̔̾̃̕ǵ̵̰̺̰͈̝̯̙̜͇͔̙̹̗͑̌̂́̓̎̒̾͂̍͑͝ứ̴̤͓̟̮̝͉͓͎̦̞̤̤̻̄̑̀͜e̵̡̢̘͍̘̯̜̼̎̃̓͊̑̔͊̚͜͝ͅb̶̧̨̨̪̜̮̤̓̍́̂̉̄̒͂͜ͅo̷̧̟̟̎̊̃͑͋̐̅̆̂͋̌̂ť̷̡̤͖̹̅̏̔̂̉̿͝'
    ];
    let rng = Math.floor(Math.random() * answers.length);
    console.log(`[Passive Mention]: [${message.author.username}] said [${message.content}] @ [${message.guild.name}], bot: [${answers[rng]}].`);

    if (rng == 'bog_img') {
      let bog_att = new Discord.MessageAttachment('bogue.jpg');
      await message.channel.send(new Discord.MessageEmbed()
        .setTitle(`Eu mesmo como como descobriu.`)
        .attachFiles(bog_att)
        .setImage(`attachment://${'bogue.jpg'}`)
        .setColor("#00FF00"));
    } else
      return message.channel.send(answers[rng]);
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
          new Discord.MessageEmbed()
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