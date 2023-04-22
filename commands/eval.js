const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate some code (bot owner only)')
        .addStringOption(option => option.setName('code').setDescription('The code you want to evaluate').setRequired(true)),
    async execute(interaction) {
        if(interaction.user.id !== '849276562963693568') return interaction.reply({content: "You don't have permission to use this command!", ephemeral: true});
        const code = interaction.options.getString('code');
        try {
            const evaluation = eval(code);
            await interaction.reply({content: `Evaluated code: \`\`\`js\n${code}\`\`\` Returns: \`${evaluation||"nothing"}\``, ephemeral: true});
        } catch (error) {
            await interaction.reply({content: `Error: ${error}`, ephemeral: true});
            }

    },
};