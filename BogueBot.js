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
    console.log("---------------------------------");
    console.log("Loading Command Files");
    console.log("---------------------------------");
    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded.`);
        bot.commands.set(props.help.name, props);
    });
    console.log("---------------------------------");
    console.log("All files loaded sucessfully");
});

function servers_show() {
    var current_servers = bot.guilds.array();
    var members_reached = 0;
    var online_members = 0;
    
    console.log("---------------------------------");
    console.log(`Currently connected to [${current_servers.length}] servers.\nServer List:`);

    for (var i = 0; i < current_servers.length; i++) {
        if(!current_servers[i].members.presence.equals('offline')){
        online_members++;
        }
        
        online_members += current_servers[i].members.presence.equals    
        console.log(`${i + 1} - [${current_servers[i]}] - ${current_servers[i].memberCount} members - ${online_members} online.`);
        members_reached += current_servers[i].memberCount;
    
        online_members = 0;
    }
    
    console.log("---------------------------------");
    console.log(`  - [${members_reached}] members reached.`);
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

    const help_file = require('./commands/help.js');
    const music_file = require('./commands/music.js');
    const welcome_embed = new Discord.RichEmbed()
        .setColor("#00FF00")
        .setAuthor(`Obrigado por adicionar o ${bot.user.username} ao seu servidor!`, bot.user.displayAvatarURL)
        .addBlankField()
        .setDescription(`**${botconfig.prefix}${help_file.help.name}** para todas os comandos disponíveis.\n`)
        .addField(`Use o prefixo '${botconfig.prefix}' para se comunicar comigo.`, `**${botconfig.prefix}${music_file.help.name}** para usar os comandos de música\n` +
            `Ou **${botconfig.prefix}${help_file.help.name} ${music_file.help.name}** para ajuda sobre os comandos de música.`)
        .addBlankField()
        .setFooter("Fobenga, criado em ")
        .setTimestamp(bot.user.createdAt);

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

    console.log(`Welcome being sent to [${guild.owner.displayName}]\nOwner ID: [${guild.ownerID}]`);
    return guild.owner.send(welcome_embed);
});

bot.on('guildDelete', guild => {
    console.log(`${bot.user.username} left server [${guild.name}].`);
    servers_show();
});

bot.on('guildMemberAdd', member => {
    console.log(`MEMBER: [${member.displayName}] joined server -> [${member.guild.name}].`);
    const channel = member.guild.channels.find(ch => ch.name === 'general');

    if (!channel) return console.log(`No channel named 'general' found in [${guild.name}].`);

    channel.send(`${member} oiiiiiiiiiiiiiiiiiii`);
    return console.log(`Welcome message sent to [${member.displayName}] in [${member.guild.name}].`);
});

bot.on('guildMemberRemove', member => {
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    if (!channel) return;
    console.log(`User[${member.displayName}] left server[${member.guild.name}]`)
    channel.send(`**${member}** kitou tnc`);
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
        console.log(`\nUser [${message.author.username}] sent [${message}]\nserver: [${message.guild.name}]\nchannel: #${message.channel.name}`)
        if (command_file) command_file.run(bot, message, args);
    }
});
bot.login(bot_token);
