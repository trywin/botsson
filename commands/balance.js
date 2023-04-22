const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const User = require("../models/User");
const fetch = require('node-fetch');
const {"stockapi-key":apiKey} = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('See how much money you have on hand and in the bank')
        .addUserOption(option => option.setName('user').setDescription('The user to check the balance of').setRequired(false)),
    async execute(interaction) {
        let dcUser = interaction.options.getUser('user') || interaction.user

        let user = await User.findOne({ id:  dcUser.id});
        if (!user) user = await User.create({ id: dcUser.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if(user.bank===undefined) user.bank = 0;
        if(user.money===undefined) user.money = 0;

        const stocks = user.stocks;
        const cryptos = user.crypto;

        let assetsPrice = 0;

        if(stocks){
            for await (const stock of stocks) {
                const stockData = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.name}&apikey=${apiKey}`).then(r=>r.json());
                const stockPrice = stockData["Global Quote"]["05. price"];
                assetsPrice += stockPrice * stock.amount;
            }
        }
        if(cryptos){
            for await (const crypto of cryptos) {
                const data = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto.name}&vs_currencies=usd`).then(response => response.json());
                const cryptoPrice = data[crypto.name].usd;
                assetsPrice += cryptoPrice * crypto.amount;
            }
        }
        const balanceEmbed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: dcUser.username, iconURL: dcUser.avatarURL()})
        .setTitle('Balance')
        .addFields(
            {name:"Wallet", value: `\`$${Number(user.money.toFixed(2))}\``, inline: true},  
            {name:"Bank", value: `\`$${Number(user.bank.toFixed(2))}\``, inline: true},
            {name:"Value of Assets", value: `\`$${Number(assetsPrice.toFixed(2))}\``, inline: true},
        )
        .setTimestamp()
        await interaction.reply({embeds: [balanceEmbed]});
        
    },
};