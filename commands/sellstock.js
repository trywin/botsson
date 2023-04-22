const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const User = require("../models/User");
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellstock')
        .setDescription('Sell your stocks')
        .addStringOption(option => option.setName('stock').setDescription('The stock to sell').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of stocks to sell').setRequired(true)),
    async execute(interaction) {
        const stock = interaction.options.getString('stock');
        const amount = interaction.options.getInteger('amount');
        const userData = await User.findOne({ id:  interaction.user.id});
        if (!userData) {
            await interaction.reply({content: "You don't have any stocks to sell!", ephemeral: true});
            return;
        }
        if (!userData.stocks) {
            await interaction.reply({content: "You don't have any stocks to sell!", ephemeral: true});
            return;
        }
        const stockData = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=J4V7K4PZ3Y3Z3Y1E`).then(response => response.json());
        if (!stockData["Global Quote"]["05. price"]) {
            await interaction.reply({content: "That stock doesn't exist!", ephemeral: true});
            return;
        }
        if (amount <= 0) {
            await interaction.reply({content: "You can't sell less than 1 stock!", ephemeral: true});
            return;
        }
        const userStock = userData.stocks.find(userStock => userStock.name === stock);
        if (!userStock) {
            await interaction.reply({content: "You don't have any of that stock to sell!", ephemeral: true});
            return;
        }
        if (userStock.amount < amount) {
            await interaction.reply({content: "You don't have enough of that stock to sell that much!", ephemeral: true});
            return;
        }
        const price = stockData["Global Quote"]["05. price"]*amount;
        userStock.amount -= amount;
        if (userStock.amount === 0) {
            userData.stocks = userData.stocks.filter(userStock => userStock.name !== stock);
        }
        userData.money += price;
        await userData.save();
        const embed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setTitle(`Sold ${amount} ${stock} stocks`)
        .addFields(
            {name: "Price", value: `$${price}`, inline: true},
            {name: "Stock Price", value: `$${stockData["Global Quote"]["05. price"]}`, inline: true},
            {name: "Price at Purchase", value: `$${userStock.price*amount}`, inline: true},
            {name: "Amount", value: `${amount}`, inline: true},
            {name: "Total Stocks Remaining", value: `${userStock.amount}`, inline: true},
            {name: "Profit", value: `$${price-(userStock.price*amount)}`, inline: true},

        )
        .setTimestamp()
        await interaction.reply({embeds: [embed]});
    },
};
