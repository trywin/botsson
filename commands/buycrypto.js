const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fetch = require('node-fetch');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buycrypto')
        .setDescription('Buy crypto currency with bot money')
        .addStringOption(option => option.setName('crypto').setDescription('Crypto name').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('Amount of crypto to buy').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('crypto');
        const amount = interaction.options.getString('amount');

        const data = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`).then(response => response.json());
        console.log(data)

        const user = await User.findOne({id: interaction.user.id}) || await User.create({id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0});

        const cryptoPrice = data[crypto]?.usd;

        if (!cryptoPrice) {
            return interaction.reply({content: 'Invalid crypto name. Examples: \`monero, bitcoin, ethereum, dogecoin\`', ephemeral: true});
        }

        if(user.money < cryptoPrice*amount) {
            return interaction.reply({content: `You do not have enough money to buy this crypto currency. You need $${cryptoPrice}`, ephemeral: true});
        }

        user.money -= cryptoPrice*amount;
        user.crypto.push({name: crypto, amount, price: cryptoPrice});
        await user.save();

        const embed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setTitle(`Successfully bought ${amount} ${crypto} for $${cryptoPrice*amount}!`)
        .addFields(
            {name: "Stock Price", value: `$${cryptoPrice}`},
            {name: "Total Price", value: `$${cryptoPrice*amount}`},
            {name: "Amount", value: `${amount}`},
            {name: "Money Left", value: `$${user.money}`},
        )
        .setTimestamp()
        await interaction.reply({embeds: [embed]});
    },
};