const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { PermissionFlagsBits } = require ('discord-api-types/v10');

const User = require("../models/User");

module.exports = {
    //make command only usable by admins
    data: new SlashCommandBuilder()
        .setName('setbalance')
        .setDescription('Set users balance')
        .addUserOption(option => option.setName('user').setDescription('User to set money').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of money to set').setRequired(true))
        .addBooleanOption(option => option.setName('bank').setDescription('Set money in bank').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        
        let dcUser = interaction.options.getUser('user')

        let user = await User.findOne({ id: dcUser.id});
        if (!user) user = await User.create({ id: dcUser.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        
        const isBank=!!interaction.options.getBoolean('bank')
        if (isBank) {
            user.bank = interaction.options.getInteger('amount');
        } else {
            user.money = interaction.options.getInteger('amount');
        }

        await user.save();
        const balanceEmbed = new EmbedBuilder()
        .setColor(0xaa00cc)
        .setAuthor({name: dcUser.username, iconURL: dcUser.avatarURL()})
        .setTitle('Balance')
        .addFields(
            {name:"Wallet", value: `\`$${user.money}\``, inline: true},  
            {name:"Bank", value: `\`$${user.bank}\``, inline: true},
        )
        .setTimestamp()
        await interaction.reply({content:`${isBank?"Bank":"Wallet"} balance updated to: \`$${isBank?user.bank:user.money}\``,embeds: [balanceEmbed]});
    },
};