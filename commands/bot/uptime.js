const Discord = require('discord.js');

function ms_convert(ms, bot) {
  days = Math.floor(ms / (24 * 60 * 60 * 1000));
  daysms = ms % (24 * 60 * 60 * 1000);
  hours = Math.floor((daysms) / (60 * 60 * 1000));
  hoursms = ms % (60 * 60 * 1000);
  minutes = Math.floor((hoursms) / (60 * 1000));
  minutesms = ms % (60 * 1000);

  let hourword = 'hora';
  let minuteword = 'minuto';

  if (hours !== 1) hourword = 'horas';
  if (minutes !== 1) minuteword = 'minutos';

  let hourstring = `**${hours} ${hourword} e`;
  let minutestring = `**${minutes} ${minuteword}.**`;
  let fulltime_string = ``;

  if (((24 * 60 * 60 * 1000) - bot.uptime) >= (60 * 60 * 100))
    fulltime_string += hourstring + minutestring;
  else
    fulltime_string += minutestring;

  return fulltime_string;
}

module.exports.run = async (bot, message, args) => {
  return message.channel.send(new Discord.RichEmbed().addField(`Tempo restarte do ${bot.user.username} até a próxima reinicialização.`,
      ms_convert((24 * 60 * 60 * 1000) - bot.uptime, bot))
    .setColor("#00FF00"));
}

module.exports.help = {
  name: 'uptime',
  descr: 'Mostra o tempo restante até o bot ser reiniciado. (24h)'
}