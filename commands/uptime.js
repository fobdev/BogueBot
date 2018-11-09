const Discord = require('discord.js');

function ms_convert(ms){
    days = Math.floor(ms / (24*60*60*1000));
    daysms=ms % (24*60*60*1000);
    hours = Math.floor((daysms)/(60*60*1000));
    hoursms=ms % (60*60*1000);
    minutes = Math.floor((hoursms)/(60*1000));
    minutesms=ms % (60*1000);
    
    var day_string = 'day';
    var hour_string = 'hour';
    var minute_string = 'minute';
    
    if(days > 1 || days === 0) day_string = 'days';
    if(hours > 1 || hours === 0) hour_string = 'hours';
    if(minutes > 1 || minutes === 0) minute_string = 'minutes';
    
    return `**${days} ${day_string}, ${hours} ${hour_string}, ${minutes} ${minute_string}.**`;
}

module.exports.run = async (bot,message,args) => {
  return message.channel.send(new Discord.RichEmbed().addField(`Tempo online do ${bot.user.username} desde a ultima atualização.`,
  ms_convert(bot.uptime))
  .setColor("#00FF00"));
}

module.exports.help = {
  name: 'uptime'
}
