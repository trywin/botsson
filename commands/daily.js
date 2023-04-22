const { SlashCommandBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Get your daily money'),
    async execute(interaction) {
        
        let user = await User.findOne({ id: interaction.user.id });
        if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if(user.bank===undefined) user.bank = 0;
        if(user.money===undefined) user.money = 0;
        const lastDaily = user.lastDaily;
        const timeDiff = Date.now() - lastDaily;
        const timeLeft = 86400000 - timeDiff;

        if (timeLeft > 0) {
            const timeLeftHours = Math.floor(timeLeft / 3600000);
            const timeLeftMinutes = Math.floor((timeLeft % 3600000) / 60000);
            const timeLeftSeconds = Math.floor(((timeLeft % 360000) % 60000) / 1000);
            return interaction.reply({content:`You already claimed your daily reward. Come back in ${timeLeftHours}h ${timeLeftMinutes}m ${timeLeftSeconds}s`});
        } else {
            const amount = Math.floor(Math.random() * 100) + 1;
            user.money += amount;
            user.lastDaily = Date.now();
            await user.save();
            return interaction.reply({content:`You claimed your daily reward of $${amount}`});
        }
    },
};