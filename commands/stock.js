const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder} = require('discord.js');
const {"stockapi-key":apiKey} = require('../config.json');
const fetch = require('node-fetch');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('View stock price')
        .addStringOption(option => option.setName('stock').setDescription('Stock symbol').setRequired(true)),
        async execute(interaction) {
        const stock = interaction.options.getString('stock');
        
        const stockData = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${apiKey}`);
        const stockJson = await stockData.json();
        const stockPrice = stockJson["Global Quote"]["05. price"];
        const stockChange = stockJson["Global Quote"]["10. change percent"];
        const stockName = stockJson["Global Quote"]["01. symbol"];
        
        if (stockName == undefined) {
            await interaction.reply("Could not find that stock!", {ephemeral: true});
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${stockName} Stock Price`)
            .setDescription(`Price: $${stockPrice}
            Change: ${stockChange}`)
            .setColor(0x00ff00)
            .setTimestamp();

        interaction.reply({embeds: [embed]});

                



        
    },

};
