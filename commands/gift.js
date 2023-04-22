const { SlashCommandBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Gift someone money')
        .addUserOption(option => option.setName('user').setDescription('The user you want to gift').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of money you want to gift').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (amount <= 0) {
            await interaction.reply({content: "You can't gift less than $1!", ephemeral: true});
            return;
        }
        let sender = await User.findOne({ id:  interaction.user.id});
        if (!sender) sender = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if (amount > sender.money) {
            await interaction.reply({content: "You don't have enough money to gift that much!", ephemeral: true});
            return;
        }
        let receiver = await User.findOne({ id:  user.id});
        if (!receiver) receiver = await User.create({ id: user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        sender.money -= amount
        receiver.money += amount
        await sender.save();
        await receiver.save();
        await interaction.reply({content: `You gave $${amount} to ${user.username}!`});
    },
};