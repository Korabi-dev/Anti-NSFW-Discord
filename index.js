const axios = require('axios')
const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')
const discord = require("discord.js")
require("dotenv").config()
const client = new discord.Client({intents: 32767})
async function isnsfw(url) {
    let r = false;
  const pic = await axios.get(url, {
    responseType: 'arraybuffer',
  })
  const model = await nsfw.load()
  const image = await tf.node.decodeImage(pic.data,3)
  const predictions = await model.classify(image)
  image.dispose()
  predictions.map((pr) => {
    pr.probability = Math.round(pr.probability * 100)
    console.log(pr.className, pr.probability)
    if(pr.className == "Hentai" && pr.probability > 35) r = true
    if(pr.className == "Porn" && pr.probability > 35) r = true
    if(pr.className == "Sexy" && pr.probability > 35) r = true
  })
  return r
}

client.on("messageCreate", async(message) => {
    if(!message.attachments || message.author.bot == true || message.channel.nsfw == true) return;
message.attachments.map(async(attachment) => {
        if(await isnsfw(attachment.url) == true){
            await message.delete()
            message.channel.send({embeds: [new discord.MessageEmbed().setTitle("No nsfw here").setDescription(`${message.author} you can NOT send nsfw here.`).setColor("DARK_RED")]})
        } 

})
})

client.on("ready", () => {
    console.log(`${client.user.tag} is now online.`)
})

client.login(process.env.token)