const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const User = require("../models/User");
const {"stockapi-key":apiKey} = require('../config.json');

function fetchStockData(stock) {
    return new Promise((resolve, reject) => {
        const request = require('request');
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=${apiKey}`;
        request(url, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            resolve(body);
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buystock')
        .setDescription('Buy irl stocks with fake money')
        .addStringOption(option => option.setName('stock').setDescription('The stock you want to buy').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of stocks you want to buy').setRequired(true)),
        async execute(interaction) {

        let user = await User.findOne({ id:          interaction.user.id});
        if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });

        const stockName = interaction.options.getString('stock');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            await interaction.reply("You can't buy less than 1 stock!");
            return;
        }

        if(user.bank===undefined) user.bank = 0;
        if(user.money===undefined) user.money = 0;
        const stockData = await fetchStockData(stockName);
        console.log(stockData);
        if (stockData["Global Quote"]["01. symbol"] == undefined) {
            await interaction.reply("That stock doesn't exist!");
            return;
        }

        const stockPrice = stockData["Global Quote"]["05. price"];
        const totalPrice = stockPrice * amount;

        if (user.money < totalPrice) {
            await interaction.reply(`You don't have enough money! You need $${totalPrice}`);
            return;
        }

        user.money -= totalPrice;

        if(!user.stocks){
            user.stocks = [];
        }

        user.stocks.push({
            name: stockName,
            amount: amount,
            price: stockPrice,
        });


        await user.save();

        
        const embed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setTitle(`Successfully bought ${amount} ${stockName} stocks for $${totalPrice}!`)
        .addFields(
            {name: "Stock Price", value: `$${stockPrice}`},
            {name: "Total Price", value: `$${totalPrice}`},
            {name: "Amount of Stocks", value: `${amount}`},
            {name: "Money Left", value: `$${user.money}`},
        )
        .setTimestamp()
        await interaction.reply({embeds: [embed]});
        
    },
};