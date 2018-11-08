const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const helper = require("./core/helper");
const fs = require("fs");
const i18n = require("i18n");

var bot_token = helper.loadKeys("token");

const bot = new Discord.Client({
    disableEveryone: true
});

bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");

    if (jsfile.length < 1) {
        throw new Error("Could not find commands.")
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded sucessfully.`);
        bot.commands.set(props.help.name, props);
    });
});

function servers_show() {
    var current_servers = bot.guilds.array();
    console.log("---------------------------------");
    console.log(`Currently connected to [${current_servers.length}] servers.\nServer List:`);
    for (var i = 0; i < current_servers.length; i++) {
        console.log(`${i + 1} - [${current_servers[i]}]`);
    }
    console.log("---------------------------------");
}

bot.on('ready', async () => {
    console.log("---------------------------------");
    console.log(`${bot.user.username} is online!`);
    servers_show();

    const helpfile = require("./commands/help.js");
    bot.user.setActivity(`${botconfig.prefix}${helpfile.help.name} para a redpill.`, {
        type: 'PLAYING'
    });
});

bot.on('guildCreate', guild => {
    const welcome_embed = new Discord.RichEmbed()
        .setAuthor(`${bot.user.username}`, bot.user.displayAvatarURL)
        .setColor("#00FF00")
        .setFooter("Fobenga, criado em ")
        .setTimestamp(bot.user.createdAt)
        .addBlankField()
        .setDescription("**>help** para todas os comandos disponíveis.\n" +
            "**>help here** para receber os coamndos de ajuda no canal.")
        .addField("Use o prefixo '>' para se comunicar comigo.", "**>music** ou **>m** para usar os comandos de música\n" +
            "Ou **>help music** para ajuda sobre os comandos de música.")
        .addBlankField();

    const general_channel = guild.channels.find(ch => ch.name === 'general');
    const bots_channel = guild.channels.find(ch => ch.name === 'bots');
    const music_channel = guild.channels.find(ch => ch.name === 'music');
    const musica_channel = guild.channels.find(ch => ch.name === 'musica');
    if (!general_channel) console.log("No channel named 'general' found in this server.");
    else general_channel.send(welcome_embed);
    if (!bots_channel) console.log("No channel named 'bots' found in this server.");
    else bots_channel.send(welcome_embed);
    if (!music_channel) console.log("No channel named 'music' found in this server.");
    else bots_channel.send(welcome_embed);
    if (!musica_channel) console.log("No channel named 'musica' found in this server.");
    else bots_channel.send(welcome_embed);


    console.log("---------------------------------");
    console.log(`${bot.user.username} joined server [${guild.name}].`);
    console.log("---------------------------------");
    servers_show();

    return guild.owner.send(welcome_embed);
});

bot.on('guildDelete', guild => {
    console.log(`${bot.user.username} left server [${guild.name}]`)
    servers_show();
});

bot.on('guildMemberAdd', member => {
    console.log(`MEMBER:[${member.displayName}] joined server -> [${member.guild.name}].`);
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    if (!channel) {
        console.log(`No channel named 'general' found in ${guild.name}.`);
        return;
    }

    channel.send(`${member} oiiiiiiiiiiiiiiiiiii`);
    console.log(`Welcome message to [${member.displayName}] in [${member.guild.name}] sent sucessfully.`);
});

bot.on('guildMemberRemove', member => {
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    if (!channel) return;
    console.log(`User [${member.displayName}] left server [${member.guild.name}]`)
    channel.send(`**${member} kito tnc**`);
});

bot.on('message', async message => {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    let command_file = bot.commands.get(cmd.slice(prefix.length));
    if (cmd[0] === prefix) {
        console.log(`\nUser '${message.author.username}'` +
            ` sent [${message}]\nserver '${message.guild.name}'\nchannel '#${message.channel.name}'`);

        if (command_file) command_file.run(bot, message, args);

    }
});
bot.login(bot_token);