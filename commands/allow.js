const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require('../models/User');
const { PermissionFlagsBits } = require ('discord-api-types/v10');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allow')
        .setDescription('Tillåt någon åtkomst till hotboxen')
        .addUserOption(option => option.setName('user').setDescription('Användare att tillåta').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const userData = await User.findOne({ id: interaction.options.getUser('user').id })||await User.create({ id: interaction.options.getUser('user').id});
        if(userData){
            userData.grantedAccess = true;
            await userData.save();
        }

        interaction.reply({content:`${interaction.options.getUser('user').username} har nu tillåtelse att använda hotboxen`, ephemeral: true});
            
    },
};