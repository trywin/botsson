const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Vill du joina hotboxen? Skriv detta och sitt i en voice chat'),
    async execute(interaction, client) {
        interaction.reply('Förfrågan skickad.', { ephemeral: true });

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Request')
            .setDescription(`${interaction.user} vill ha åtkomst till hotboxen`)
            .setTimestamp();
        
        const channel = await client.channels.fetch('1097107299966922822').catch(e=>e);

        const accbutton = new ButtonBuilder()
            .setCustomId('yes')
            .setLabel('JA')
            .setStyle('Success');
        
        const denybutton = new ButtonBuilder()
            .setCustomId('no')
            .setLabel('nej')
            .setStyle('Danger');

        const row = new ActionRowBuilder()
            .addComponents(accbutton, denybutton);
        

        const msg = await channel.send({ embeds: [embed], components: [row]});

        const filter = i => i.user.id === interaction.user.id;

        const collector = msg.createMessageComponentCollector({ filter, max: 1 });

        collector.on('collect', async i => {
            //check if yes or no is pressed

            if (i.customId === 'yes') {
                if(interaction.member.voice.channel && interaction.member.voice.channel.id !== "1089954959333789726") {
                    const channel = interaction.guild.channels.cache.get("1089954959333789726");
                    interaction.member.voice.setChannel(channel);
                    console.log(interaction.user.username + " has been granted access to hotbox")
                    return;
                }
                const user = await User.findOne({ id: interaction.user.id })|| await User.create({ id: interaction.user.id });
                user.grantedAccess = true;
                console.log(interaction.user.username + " has been granted access to hotbox")
                await user.save();
                interaction.followUp({ content: 'Du har nu åtkomst till hotboxen!', ephemeral: true }).catch(e=>e);
                msg.delete().catch(e=>e)
            } else {
                interaction.followUp({ content: 'Du har nekats åtkomst till hotboxen.', ephemeral: true }).catch(e=>e);
                msg.delete().catch(e=>e)
            }
        });
        


    },
};