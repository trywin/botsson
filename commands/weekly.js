const { SlashCommandBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Get your weekly money'),
    async execute(interaction) {
        
        let user = await User.findOne({ id: interaction.user.id });
        if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if(user.bank===undefined) user.bank = 0;
        if(user.money===undefined) user.money = 0;
        const lastWeekly = user.lastWeekly;
        const timeDiff = Date.now() - lastWeekly;
        const timeLeft = 604800000 - timeDiff;

        if (timeLeft > 0) {
            const timeLeftDays = Math.floor(timeLeft / 86400000);
            const timeLeftHours = Math.floor((timeLeft % 86400000) / 3600000);
            const timeLeftMinutes = Math.floor(((timeLeft % 86400000) % 3600000) / 60000);
            const timeLeftSeconds = Math.floor((((timeLeft % 86400000) % 3600000) % 60000) / 1000);
            return interaction.reply({content:`You already claimed your weekly reward. Come back in ${timeLeftDays}d ${timeLeftHours}h ${timeLeftMinutes}m ${timeLeftSeconds}s`});
        } else {
            const amount = Math.floor(Math.random() * 800) + 200;
            console.log(amount)
            user.money += amount;
            user.lastWeekly = Date.now();
            await user.save();
            return interaction.reply({content:`You claimed your weekly reward of $${amount}`});
        }
    },
};