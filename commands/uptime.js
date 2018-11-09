const Discord = require('discord.js');

function ms_convert(ms){
    days = Math.floor(ms / (24*60*60*1000));
    daysms=ms % (24*60*60*1000);
    hours = Math.floor((daysms)/(60*60*1000));
    hoursms=ms % (60*60*1000);
    minutes = Math.floor((hoursms)/(60*1000));
    minutesms=ms % (60*1000);
    sec = Math.floor((minutesms)/(1000));
    return days + " dias, " + hours + ", horas e " + minutes + " miutos.";
}

module.exports.run = async (bot,message,args) => {
  return message.channel.send(new Discord.RichEmbed().addField(`Tempo online do ${bot.user.username} desde a ultima atualização`,
  ms_convert(bot.uptime))
  .setColor("#00FF00"));
}

module.exports.help = {
  name: 'uptime'
}
