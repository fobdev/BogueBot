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
    console.log("---------------------------------");

    // All the servers that the bot are in.
    var current_servers = bot.guilds.array();

    // All the users that can see the bot.
    var members_reached = 0;

    console.log("---------------------------------");
    console.log(`Currently connected to [${current_servers.length}] servers.\nServer List:`);

    // Get the name of all the servers
    for (var i = 0; i < current_servers.length; i++) {
        var user_inserver = current_servers[i].members.array();
        var online_inserver = 0;

        // Get all the users in the current server loop
        for (let j = 0; j < user_inserver.length; j++) {
            var is_online = user_inserver[j].presence.status;

            // Verify every member to see if it is not offline (can be AFK / Do Not Disturb / Online).
            if (is_online !== 'offline') online_inserver++;

            // Finishes the current loop and restart the variable to count again in the next server
            if (j === user_inserver - 1) online_inserver = 0;
        }

        console.log(`${i + 1} - [${current_servers[i]}] - ` +
            `${online_inserver} online from ${current_servers[i].memberCount} members.`);
        members_reached += current_servers[i].memberCount;
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

    const bots_channel = guild.channels.find(ch => ch.name === 'bots');
    const music_channel = guild.channels.find(ch => ch.name === 'music');

    if (!bots_channel) console.log("No channel named 'bots' found in this server.");
    else bots_channel.send(welcome_embed);
    if (!music_channel) console.log("No channel named 'music' found in this server.");
    else bots_channel.send(welcome_embed);

    console.log("---------------------------------");
    console.log(`${bot.user.username} joined server [${guild.name}].`);
    console.log("---------------------------------");
    servers_show();

    const system_channel = guild.channels.find(ch => ch.id === guild.systemChannelID);
    try {
        system_channel.send(welcome_embed);
    } catch (e) {
        console.log('No System Channel Avaliable');
    }

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
    channel.send(new Discord.RichEmbed()
        .setDescription(`**${member}** saiu do servidor.`)
        .setColor("#FF0000"));
});

var copycat_switch = false;
bot.on('message', async message => {

    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];


    /*
    The reason why put the 'copycat' command here is because it
    get a message without the prefix and the bot only recognisizes
    messages with the prefix as seen below the copycat command block.
    */

    // start of copycat command
    if (message.content === `${prefix}copycat`) {
        if (!copycat_switch) {
            copycat_switch = true;
            return message.channel.send(new Discord.RichEmbed()
                .setDescription('Copycat **ativado**.')
                .setColor('#00FF00'));
        } else {
            copycat_switch = false;
            return message.channel.send(new Discord.RichEmbed()
                .setDescription('Copycat **desativado**.')
                .setColor('#FF0000'));
        }
    }

    if (copycat_switch) message.channel.send(message.content);
    // end of copycat command

    let command_file = bot.commands.get(cmd.slice(prefix.length));
    if (cmd[0] === prefix) {
        if (command_file) command_file.run(bot, message, args);
        console.log(`\nUser [${message.author.username}] sent [${message}]\nserver: [${message.guild.name}]\nchannel: #${message.channel.name}`)
        console.log(`${bot.user.username} is copycating: ${copycat_switch}`)
    }
});

bot.login(bot_token);