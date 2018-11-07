const fs = require("fs");
const token_file_name ="./bottoken.json";

module.exports.loadKeys = (key) => {

    // Priority for runtime setting
    if( process.env.hasOwnProperty(key)) 
        return process.env[key];

    if( fs.existsSync(token_file_name) ){
        var token_file = require.main.require(token_file_name);
        console.log(token_file);
        return token_file[key];
    }
    throw new Error("Error load Keys");
}
