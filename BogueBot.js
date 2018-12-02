const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const helper = require("./core/helper");
const fs = require("fs");
const i18n = require("i18n");
var functions_used = 0;
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
        try {
            bot.commands.set(props.help.name_2, props);

            // names 3 and 4 are exclusively used for music command.
            bot.commands.set(props.help.name_3, props);
            bot.commands.set(props.help.name_4, props);
        } catch (e) {
            console.error(`${e}: Secondary / terciary command name not loaded properly.`);
        }
    });
    console.log("---------------------------------");
    console.log("All files loaded sucessfully");
});

function servers_show() {
    // All the servers that the bot are in.
    var current_servers = bot.guilds.array();

    // All the users that can see the bot.
    var members_reached = 0;
    var online_total = 0;

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
            if (is_online !== 'offline') {
                online_inserver++;
                online_total++;
            }

            // Finishes the current loop and restart the variable to count again in the next server
            if (j === user_inserver - 1) online_inserver = 0;
        }

        console.log(`${i + 1} - [${current_servers[i]}] - ` +
            `${online_inserver} online from ${current_servers[i].memberCount} members.`);
        members_reached += current_servers[i].memberCount;
    }

    console.log("---------------------------------");
    console.log(`  - [${members_reached}] users reached | [${online_total}] online.`);
    console.log("---------------------------------");

}

function status_updater() {
    var current_servers = bot.guilds.array();
    var members_reached = 0;

    for (var i = 0; i < current_servers.length; i++) members_reached += current_servers[i].memberCount;

    var cmd_plural = 'função';
    if (functions_used !== 1)
        cmd_plural = 'funções';

    const helpfile = require("./commands/help.js");
    const invitefile = require("./commands/invite.js");
    bot.user.setActivity(`${botconfig.prefix}${helpfile.help.name} | ${botconfig.prefix}${invitefile.help.name}` +
        ` | ${members_reached} usuários usaram ${functions_used} ${cmd_plural} hoje.`, {
            type: 'PLAYING'
        });
}

bot.on('ready', async () => {
    console.log("---------------------------------");
    console.log(`${bot.user.username} is online!`);
    servers_show();
    status_updater();
    return;
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
    else {
        bots_channel.send(welcome_embed);
        console.log("Welcome message sent at 'bots' channel.");
    }
    if (!music_channel) console.log("No channel named 'music' found in this server.");
    else {
        bots_channel.send(welcome_embed);
        console.log("Welcome message sent at 'music' channel.")
    }
    console.log("---------------------------------");
    console.log(`${bot.user.username} joined server [${guild.name}].`);
    servers_show();

    const system_channel = guild.channels.find(ch => ch.id === guild.systemChannelID);
    try {
        system_channel.send(welcome_embed);
    } catch (e) {
        console.log('No System Channel Available');
    }

    if (system_channel) {
        console.log("Welcome message sent to system channel.");
    }

    console.log(`Welcome being sent to [${guild.owner.displayName}]\nOwner ID: [${guild.ownerID}]`);

    guild.owner.send(welcome_embed);
    status_updater();
    return;
});

bot.on('guildDelete', guild => {
    console.log(`${bot.user.username} was kicked/banned from server [${guild.name}].`);
    servers_show();
    status_updater();
    return;
});

bot.on('guildMemberAdd', member => {
    console.log(`MEMBER: [${member.displayName}] joined server -> [${member.guild.name}].`);
    status_updater();
    return;
});

bot.on('guildMemberRemove', member => {
    console.log(`MEMBER: [${member.displayName}] left server -> [${member.guild.name}].`)
    status_updater();
    return;
});

bot.on('message', async message => {

    if (message.author.bot) {
        functions_used++;
        status_updater();
    }

    if (message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    let command_file = bot.commands.get(cmd.slice(prefix.length));

    if (cmd[0] === prefix) {
        if (command_file) {
            console.log(`\nUser [${message.author.username}] sent [${message}]\nserver: [${message.guild.name}]\nchannel: #${message.channel.name}`)
            command_file.run(bot, message, args);
        }
    }

});

bot.login(bot_token);