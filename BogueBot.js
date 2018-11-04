const botconfig = require("./botconfig.json");
//const bot_token = require("./bottoken.json");
const Discord = require("discord.js");
const fs = require("fs");

const bot = new Discord.Client(
{
    disableEveryone: true
});

bot.commands = new Discord.Collection();

fs.readdir('./commands/', (err, files) =>
{
    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length < 1)
    {
        console.log("Could not find commands.");
    }

    jsfile.forEach((f, i) =>
    {
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded sucessfully.`);
        bot.commands.set(props.help.name, props);
    });
});

function servers_show()
{
    var current_servers = bot.guilds.array();
    console.log("---------------------------------");
    console.log(`Currently connected to [${current_servers.length}] servers.\nServer List:`);
    for (var i = 0; i < current_servers.length; i++)
    {
        console.log(`${i + 1} - [${current_servers[i]}]`);
    }
    console.log("---------------------------------");
}

bot.on('ready', async () =>
{
    console.log("---------------------------------");
    console.log(`${bot.user.username} is online!`);
    servers_show();

    const helpfile = require("./commands/help.js");
    bot.user.setActivity(`${botconfig.prefix}${helpfile.help.name} para a redpill.`,
    {
        type: 'PLAYING'
    });
});

bot.on('guildCreate', guild =>
{

    const welcome_embed = new Discord.RichEmbed();

    const channel = guild.channels.find(ch => ch.name === 'general');
    if (!channel) return console.log("No channel named 'general' found in this server.");

    console.log(`${bot.user.username} joined server [${guild.name}].`)
    servers_show();

    channel.send("**Conheçam Hades.**");
});

bot.on('guildDelete', guild =>
{
    console.log(`${bot.user.username} left server [${guild.name}]`)
    servers_show();
});

bot.on('guildMemberAdd', member =>
{
    console.log(`MEMBER:[${member.displayName}] joined server -> [${member.guild.name}].`);
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    if (!channel)
    {
        console.log(`No channel named 'general' found in ${guild.name}.`);
        return;
    }

    channel.send(`**${member} oiiiiiiiiiiiiiiiiiii**`);
    console.log(`Welcome message to [${member.displayName}] in [${member.guild.name}] sent sucessfully.`);
});

bot.on('guildMemberRemove', member =>
{
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    if (!channel) return;
    console.log(`User [${member.displayName}] left server [${member.guild.name}]`)
    channel.send(`**${member} kito tnc**`);
});

var everyonecount = 0;

bot.on('message', async message =>
{

    if (message.author.bot) return;
    if (message.channel.type === "dm")
    {
        return message.channel.send("Don't talk to me or to my son ever again.");
    }

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    if (message.mentions.everyone)
    {
        everyonecount++;

        switch (everyonecount)
        {
            case 1:
                message.channel.send("oi");
                break;
            case 2:
                message.channel.send("que eh vei");
                break;
            case 3:
                message.channel.send("para d marca everyone vei tnc");
                break;
            case 4:
                message.channel.send("enfia o everyone no cu");
                break;
            case 5:
                message.channel.send("tnc com esse everyone");
                break;
            case 6:
                message.channel.send("AAAAAAAAA PARA VEI PQP");
                everyonecount = 0;
                break;
            default:
                break;
        }
    }

    let command_file = bot.commands.get(cmd.slice(prefix.length));
    if (cmd[0] === prefix)
    {

        console.log(`User '${message.author.username}'` +
            ` sent [${message}] at server '${message.guild.name}' `);

        if (command_file) command_file.run(bot, message, args);

    }
});

bot.login(process.env.BOT_TOKEN);
//bot.login(bot_token.token)