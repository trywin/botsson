const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show server stats'),
    async execute(interaction) {
        const exampleEmbed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setTitle('Server Stats')
        .addFields(
            { name: 'Server name', value: interaction.guild.name+"", inline: true },
            { name: 'Member count', value: interaction.guild.memberCount+"", inline: true },
            { name: 'Server ID', value: interaction.guild.id+"", inline: true },
            { name: 'Server created at', value: interaction.guild.createdAt+"", inline: true },
            { name: 'Server verification level', value: interaction.guild.verificationLevel+"", inline: true },
            { name: 'Server features', value: interaction.guild.features+"", inline: true },
            { name: 'Server boost level', value: interaction.guild.premiumTier+"", inline: true },
            { name: 'Server boost count', value: interaction.guild.premiumSubscriptionCount+"", inline: true },
        )
        .setImage(`https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.png`)
        .setTimestamp()
        await interaction.reply({embeds: [exampleEmbed]});
    },
};