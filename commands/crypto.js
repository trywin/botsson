const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('View crypto prices')
        .addStringOption(option => option.setName('crypto').setDescription('Crypto name').setRequired(true)),
    async execute(interaction) {
        const crypto = interaction.options.getString('crypto');

        const data = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`).then(response => response.json());
        console.log(data)

        const cryptoPrice = data[crypto]?.usd;

        if (!cryptoPrice) {
            return interaction.reply({content: 'Invalid crypto name. Examples: \`monero, bitcoin, ethereum, dogecoin\`', ephemeral: true});
        }

        const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

        const cryptoEmbed = new EmbedBuilder()
            .setTitle(`${capitalizeFirstLetter(crypto)} Price`)
            .setDescription(`Price: $${cryptoPrice}`)
            .setColor(0x00ff00)
            .setTimestamp();
        interaction.reply({embeds: [cryptoEmbed]});
    },
};