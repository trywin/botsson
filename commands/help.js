const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help for the bot'),
    async execute(interaction, client) {
        // use client.commands
        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(`${client.commands.map(c=>`**${c.data.name}** - ${c.data.description}`).join("\n")}`)

        await interaction.reply({ embeds: [embed] });

    },
};