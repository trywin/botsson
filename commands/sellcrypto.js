const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fetch = require('node-fetch');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellcrypto')
        .setDescription('Sell crypto currency')
        .addStringOption(option => option.setName('crypto').setDescription('Crypto name').setRequired(true))
        .addStringOption(option => option.setName('amount').setDescription('Amount of crypto to sell').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('crypto');
        const amount = interaction.options.getString('amount');

        const data = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`).then(response => response.json());

        const user = await User.findOne({id: interaction.user.id}) || await User.create({id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0});

        const cryptoPrice = data[crypto]?.usd;

        if (!cryptoPrice) {
            return interaction.reply({content: 'Invalid crypto name. Examples: \`monero, bitcoin, ethereum, dogecoin\`', ephemeral: true});
        }

        const cryptoIndex = user.crypto.findIndex(c => c.name === crypto);
        if (cryptoIndex === -1) {
            return interaction.reply({content: `You do not have any ${crypto} to sell.`, ephemeral: true});
        }

        if (user.crypto[cryptoIndex].amount < amount) {
            return interaction.reply({content: `You do not have enough ${crypto} to sell.`, ephemeral: true});
        }

        const oldPrice = user.crypto[cryptoIndex].price;

        user.crypto[cryptoIndex].amount -= amount;
        if (user.crypto[cryptoIndex].amount === 0) {
            user.crypto.splice(cryptoIndex, 1);
        }


        user.money += cryptoPrice*amount;
        await user.save();

        const embed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
        .setTitle(`Successfully sold ${amount} ${crypto} for $${cryptoPrice*amount}!`)
        .addFields(
            {name: "Crypto Price", value: `$${cryptoPrice}`},
            {name: "Price at purchase", value: `$${oldPrice*amount}`},
            {name: "Total Price", value: `$${cryptoPrice*amount}`},
            {name: "Amount", value: `${amount}`},
            {name: "Profit", value: `$${cryptoPrice*amount - oldPrice*amount}`},
        )
        .setTimestamp()
        await interaction.reply({embeds: [embed]});
    },
};