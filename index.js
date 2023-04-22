const Discord = require("discord.js");
const fs = require("fs")
const config = require("./config.json");


const mongoose = require("mongoose");
mongoose.connect(config.mongodb, {  useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected");
});


const client = new Discord.Client({intents: [Discord.IntentsBitField.Flags.Guilds, Discord.IntentsBitField.Flags.GuildMessages, Discord.IntentsBitField.Flags.GuildVoiceStates, Discord.IntentsBitField.Flags.GuildMessageReactions], partials: [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.User]});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}
//0bb54997-8d61-4c52-b2d4-ef45609f5772
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}



client.login(config.token);