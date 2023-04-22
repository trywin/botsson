const { SlashCommandBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Toss a coin and see if you win!')
        .addIntegerOption(option => option.setName('bet').setDescription('How much money you want to bet').setRequired(true)),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        if (bet <= 0) {
            await interaction.reply({content: "You can't bet less than $1!", ephemeral: true});
            return;
        }
        let user = await User.findOne({ id:  interaction.user.id});
        if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if (bet > user.money) {
            await interaction.reply({content: "You don't have enough money to bet that much!", ephemeral: true});
            return;
        }
        const result = Math.random() >= 0.5;
        if (result) {
            user.money += bet
            await user.save();
            await interaction.reply({content: `You won $${bet}!`});
        } else {
            user.money -= bet
            await user.save();
            await interaction.reply({content: `You lost $${bet}!`});
        }
        
    },
};