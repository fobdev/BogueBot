const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const helper = require("./core/helper");
const fs = require("fs");
let cmd_counter = 0;
let bot_token = helper.loadKeys("token");

const bot = new Discord.Client({
    disableEveryone: true
});

bot.commands = new Discord.Collection();

function cmdload(folder) {
    let path = './commands/' + folder + '/';
    let type = path.split('./commands').pop();

    fs.readdir(path, (err, files) => {
        if (err)
            return console.error(`\n=====\nThe directory ${path.toLowerCase()} does not exist.\n=====`);

        let jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length < 1)
            throw new Error("Could not find commands.")

        console.log(`\n=== Loading ${type.toLowerCase()} ===`);
        jsfile.forEach(f => {
            let props = require(path + f)
            console.log(`[FILE LOAD SUCESS]: ${f}`);

            if (props.help.name)
                bot.commands.set(props.help.name, props);
            else
                console.warn('[WARNING]: Commands with no name are impossible to call.')

            if (props.help.name_2)
                bot.commands.set(props.help.name_2, props);

            if (props.help.name_3)
                bot.commands.set(props.help.name_3, props);

            if (props.help.name_4)
                bot.commands.set(props.help.name_4, props);
        })
    })
}

cmdload('admin');
cmdload('bot');
cmdload('user');
cmdload('fun');
cmdload('music');
cmdload('games');

function servers_show() {
    let current_servers = bot.guilds.array();
    let members_reached = 0;
    console.log("--------------------------------------------");
    console.log(`Connected to [${current_servers.length}] servers.\nServer List:`);

    // Get the name of all the servers
    for (let i = 0; i < current_servers.length; i++) {
        let leftzero = '';
        if (i < 9) leftzero += '0';
        members_reached += current_servers[i].memberCount;
        console.log(`${leftzero}${i + 1} - [${current_servers[i]}] [${current_servers[i].memberCount} members]`);
    }
    console.log("--------------------------------------------");
    console.log(`A total of [${members_reached}] Discord users reached.`);
    console.log("--------------------------------------------");
}

function status_updater() {
    let current_servers = bot.guilds.array();
    let members_reached = 0;

    for (let i = 0; i < current_servers.length; i++) members_reached += current_servers[i].memberCount;

    let cmd_plural = 'função';
    if (cmd_counter !== 1)
        cmd_plural = 'funções';

    const helpfile = require("./commands/bot/help.js");
    const invitefile = require("./commands/bot/invite.js");
    // bot.user.setStatus("dnd");
    // bot.user.setActivity(`bila me programar.`, {
    //     type: 'WATCHING'
    // });

    bot.user.setActivity(`${botconfig.prefix}${helpfile.help.name} | ${botconfig.prefix}${invitefile.help.name}` +
        ` | ${members_reached} usuários em ${current_servers.length} servidores usaram ${cmd_counter} ${cmd_plural} hoje.`, {
            type: 'PLAYING'
        });
}

bot.on('ready', async () => {
    console.log("\n---------------------------------");
    console.log(`${bot.user.username} is online!`);
    servers_show();
    status_updater();
    return;
});

bot.on('guildCreate', guild => {
    const help_file = require('./commands/bot/help.js');
    const music_file = require('./commands/music/music.js');
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

    if (bots_channel && bots_channel.type === 'text') {
        bots_channel.send(welcome_embed);
        console.log("Welcome message sent at 'bots' channel.");
    } else {
        console.log("No channel named 'bots' found in this server.");
    }

    if (music_channel && music_channel.type === 'text') {
        music_channel.send(welcome_embed);
        console.log("Welcome message sent at 'music' channel.")
    } else {
        console.log("No channel named 'music' found in this server.");
    }

    console.log("---------------------------------");
    console.log(`${bot.user.username} joined server [${guild.name}].`);
    servers_show();

    const system_channel = guild.channels.find(ch => ch.id === guild.systemChannelID);
    if (system_channel) {
        system_channel.send(welcome_embed);
        console.log("Welcome message sent to system channel.");
    } else {
        console.log('No System Channel Available');
    }

    console.log(`Welcome being sent to [${guild.owner.displayName}]\nOwner ID: [${guild.ownerID}]`);

    status_updater();
    return guild.owner.send(welcome_embed);
});

bot.on('guildDelete', guild => {
    servers_show();
    status_updater();
    return console.log(`>>${bot.user.username} was removed from server [${guild.name}].`);
});

bot.on('guildMemberRemove', member => {
    const system_channel = member.guild.channels.find(ch => ch.id === member.guild.systemChannelID);
    system_channel.send(`**${member}** kito do sv...`);
})

bot.on('message', async message => {
    if (message.author.id === bot.user.id) {
        cmd_counter++;
        status_updater();
    }

    if (message.channel.type === "dm") {
        if (message.author.id === bot.user.id) return;
        else {
            console.log(`[${message.author.username}] Direct Message: ${message.content}`)
            return bot.generateInvite(8).then(link => {
                message.channel.send(new Discord.RichEmbed()
                    .setTitle(`O ${bot.user.username} funciona apenas em servidores.`)
                    .setDescription(`Use esse convite para adiciona-lo ao seu servidor:
                **${link}**`)
                    .setColor('#FFFFFF'))
            })
        }
    }

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    let command_file = bot.commands.get(cmd.slice(prefix.length));

    if (cmd[0] === prefix) {
        // Maintenance flag
        // if (message.author.id !== "244270921286811648") {
        //     return message.channel.send(new Discord.RichEmbed()
        //         .setTitle("O bot está em manutenção no momento")
        //         .setDescription("Trabalhando para melhorar o bot, por favor use-o mais tarde."));
        // }

        if (command_file) {
            console.log(`\nUser [${message.author.username}] sent [${message}]\nserver: [${message.guild.name}]\nchannel: #${message.channel.name}`)
            try {
                command_file.run(bot, message, args);
            } catch (e) {
                console.error(`${e}: 'run' function not found in file [${command_file}].`)
            }
        }
    }
});

bot.login(bot_token);