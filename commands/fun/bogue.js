const Discord = require('discord.js');
let Canvas = require('canvas')
let ctx = canvas.getContext('2d');
let canvas = new Canvas(663, 663);
let Image = Canvas.Image();
let canvasImg = new Image();

module.exports.run = async (bot, message, args) => {
    switch (args[0]) {
        case 'prime':
            await message.channel.send(new Discord.MessageAttachment('bogueprime.jpg'));
            break;
        case 'pixel':
            await message.channel.send(new Discord.MessageAttachment('boguepixel.jpg'));
            break;
        case 'line':
            await message.channel.send(new Discord.MessageAttachment('bogueline.png'));
            break;
        default: {
            let generateMemeCanvas = function (config) {
                let defaults = {
                    top: args[0],
                    bottom: args[1],
                    imageURL: 'bogue.jpg'
                };
                let opts = Object.assign({}, defaults, config);
                console.log(opts);

                return new Promise(function (resolve, reject) {
                    request.get(opts.imageURL, function (err, response, body) {

                        if (!err && response.statusCode == 200) {
                            canvasImg.src = new Buffer(body);
                            console.log('image loaded.', new Buffer(body));
                            calculateCanvasSize();
                            drawMeme(opts.top, opts.bottom);
                            resolve(canvas.toBuffer());
                        } else {
                            reject(new Error('The image could not be loaded.'));
                        }
                    });
                });
            }

            await message.channel.send(generateMemeCanvas());
            break;
        }
    }
}

function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, memeWidth, memeHeight);

    ctx.lineWidth = 8;
    ctx.font = 'bold 50pt Impact';
    ctx.strokeStyle = 'black';
    ctx.mutterLine = 2;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let text1 = topText;
    //let text1 = bottomText;
    text1 = text1.toUpperCase();
    x = memeWidth / 2;
    y = 0;

    wrapText(ctx, text1, x, y, memeWidth, 1.6, false, 50);
    //writeText(text1, x, y);

    ctx.textBaseline = 'bottom';
    let text2 = bottomText;
    text2 = text2.toUpperCase();
    y = memeHeight;

    wrapText(ctx, text2, x, y, memeWidth, 1.6, true, 50);
}

function wrapText(context, text, x, y, maxWidth, lineHeightRatio, fromBottom, fontSize) {

    context.font = 'bold ' + fontSize + 'pt Impact';
    // If from the bottom, use unshift so the lines can be added to the top of the array.
    // Required since the lines at the bottom are laid out from bottom up.
    let pushMethod = (fromBottom) ? 'unshift' : 'push';

    _lineHeightRatio = (fromBottom) ? -lineHeightRatio : lineHeightRatio;
    let lineHeight = _lineHeightRatio * fontSize;
    console.log('lineH', lineHeight, lineHeightRatio, fontSize);
    let lines = [];
    let y = y;
    let line = '';
    let words = text.split(' ');

    for (let n = 0; n < words.length; n++) {
        let testLine = line + ' ' + words[n];
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth) {
            lines[pushMethod](line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines[pushMethod](line);

    if (lines.length > 2) {
        console.log('Too big.', fontSize);
        wrapText(context, text, x, y, maxWidth, lineHeightRatio, fromBottom, fontSize - 10);
    } else {
        for (let k in lines) {
            context.strokeText(lines[k], x, y + lineHeight * k);
            context.fillText(lines[k], x, y + lineHeight * k);
        }
    }
}

function calculateCanvasSize() {
    console.log(img.width, img.height);
    if (img.width > img.height) {
        canvas.height = img.height / img.width * canvas.width;
        memeWidth = canvas.width;
        memeHeight = canvas.height;
        console.log(canvas.width, canvas.height);
    }
}

module.exports.help = {
    name: 'bogue',
    descr: `Formas diversas de bogue.`
}