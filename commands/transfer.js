const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer money from your wallet to your bank, or vice versa')
        .addStringOption(option => option.setName('amount').setDescription('The amount of money to transfer. Write "all" to transfer all money').setRequired(true))
        .addBooleanOption(option => option.setName('bank').setDescription('Whether to transfer to your bank or not. If false it will transfer from bank to wallet').setRequired(true)),
    async execute(interaction) {
        function createBalEmbed(user) {
            const balanceEmbed = new EmbedBuilder()
            .setColor(0xaa00cc)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setTitle('Balance')
            .addFields(
                {name:"Wallet", value: `\`$${user.money}\``, inline: true},  
                {name:"Bank", value: `\`$${user.bank}\``, inline: true},
            )
            .setTimestamp()
            return balanceEmbed;
        }
        const amount = interaction.options.getString('amount');
        const bank = interaction.options.getBoolean('bank');
        if(amount!== "all" && isNaN(amount)) {
            await interaction.reply({content: "Please enter a valid amount!", ephemeral: true});
            return;
        }
        if (amount === "all") {
            let user = await User.findOne({ id:  interaction.user.id});
            if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
            if (bank) {
                if (user.money === 0) {
                    await interaction.reply({content: "You don't have any money to transfer!", ephemeral: true});
                    return;
                }
                user.bank += user.money
                user.money = 0
                await user.save();
                await interaction.reply({content: `You transferred $${user.bank} from your wallet to your bank!`, embeds: [createBalEmbed(user)]});
            } else {
                if (user.bank === 0) {
                    await interaction.reply({content: "You don't have any money to transfer!", ephemeral: true});
                    return;
                }
                user.money += user.bank
                user.bank = 0
                await user.save();
                await interaction.reply({content: `You transferred $${user.money} from your bank to your wallet!`, embeds: [createBalEmbed(user)]});
            }
            return;
        }
        if (amount <= 0) {
            await interaction.reply({content: "You can't transfer less than $1!", ephemeral: true});
            return;
        }
        let user = await User.findOne({ id:  interaction.user.id});
        if (!user) user = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if (bank) {
            if (amount > user.money) {
                await interaction.reply({content: "You don't have enough money to transfer that much!", ephemeral: true});
                return;
            }
            user.money -= amount
            user.bank += amount
            await user.save();
            await interaction.reply({content: `You transferred $${amount} from your wallet to your bank!`, embeds: [createBalEmbed(user)]});
        } else {
            if (amount > user.bank) {
                await interaction.reply({content: "You don't have enough money to transfer that much!", ephemeral: true});
                return;
            }
            user.bank -= amount
            user.money += amount
            await user.save();
            await interaction.reply({content: `You transferred $${amount} from your bank to your wallet!`, embeds: [createBalEmbed(user)]});
        }


        
    },
};