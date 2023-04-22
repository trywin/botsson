const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require("../models/User");
const fetch = require('node-fetch');
const config = require('../config.json');
const stock = require('./stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('View your portfolio')
        .addUserOption(option => option.setName('user').setDescription('The user you want to view').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const userData = await User.findOne({ id: user.id })||await User.create({ id: user.id});
        console.log(userData)
        if(userData){
            if(!userData.stocks) userData.stocks = [];
            if(!userData.crypto) userData.crypto = [];
            
            const stockPrices = [];
            for await (const stock of userData.stocks){
                const stockData = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.name}&apikey=${config['stockapi-key']}`);
                const stockJson = await stockData.json();
                stockPrices.push(Object.assign(stock, {newPrice: stockJson["Global Quote"]["05. price"]}));
            }

            const cryptoPrices = [];
            for await (const crypto of userData.crypto){
                const cryptoData = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto.name}&vs_currencies=usd`).then(response => response.json());
                cryptoPrices.push(Object.assign(crypto, {newPrice: cryptoData[crypto.name].usd}));
            }
           

            const joinedStocks = []

            stockPrices.forEach(stock => {
                const joinedStock = joinedStocks.find(joinedStock => joinedStock.name === stock.name);
                if(joinedStock){
                    joinedStock.amount += stock.amount;
                    joinedStock.price += stock.price*stock.amount;
                    joinedStock.newPrice += stock.newPrice*stock.amount;
                }else{
                    stock.price = stock.price*stock.amount;
                    stock.newPrice = stock.newPrice*stock.amount;
                    joinedStocks.push(stock);
                }
            });

            const joinedCryptos = []

            cryptoPrices.forEach(crypto => {
                const joinedCrypto = joinedCryptos.find(joinedCrypto => joinedCrypto.name === crypto.name);
                if(joinedCrypto){
                    joinedCrypto.amount += crypto.amount;
                    joinedCrypto.price += crypto.price*crypto.amount;
                    joinedCrypto.newPrice += crypto.newPrice*crypto.amount;
                }else{
                    crypto.price = crypto.price*crypto.amount;
                    crypto.newPrice = crypto.newPrice*crypto.amount;
                    joinedCryptos.push(crypto);
                } 
            });


            const portfolioEmbed = new EmbedBuilder()
            .setColor(0xaa00cc)
            .setAuthor({name: user.username, iconURL: user.avatarURL()})
            .setTitle('Portfolio')
            .addFields(
                ...stockPrices.map(stock => {
                    return {
                        name: "Stock: " + stock.name,
                        value: `Price: $${stock.newPrice.toFixed(2)}\nAmount: ${stock.amount}\nChange: ${(stock.newPrice - stock.price).toFixed(2)}`,
                        inline: true
                    }
                }),
                ...cryptoPrices.map(crypto => {
                    return {
                        name: "Crypto " + crypto.name,
                        value: `Price: $${crypto.newPrice.toFixed(2)}\nAmount: ${crypto.amount}\nChange: ${(crypto.newPrice - crypto.price).toFixed(2)}`,
                        inline: true
                    }
                }
                )
            )
            .setTimestamp()
            await interaction.reply({embeds: [portfolioEmbed]});
        }else{          
            await interaction.reply({content:`User has no portfolio`});
        }   
    },
};
        