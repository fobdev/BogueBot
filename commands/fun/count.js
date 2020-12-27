const Discord = require('discord.js');

module.exports.run = async (bot, message, args) => {
    if(message.content.includes('KK') || message.content.includes('kk') ){
            let msgarray = message.content;
            let kcount = 0;
            
            for (let int = 0; int < msgarray.length; int++) 
                if(msgarray[i] == 'K' || msgarray[i] == 'k')
                    kcount++;
    
            return message.channel.send(`${kcount} Ks`);
    } 
    else 
        message.channel.send("Não vi nenhuma risada na mensagem acima.");
}

module.exports.help = {
    name: 'contar',
    descr: `Conta as risadas da mensagem acima`
}