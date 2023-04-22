const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require('../models/User');
const { Embed } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play blackjack against the bot!')
        .addIntegerOption(option => option.setName('bet').setDescription('The amount of money you want to bet').setRequired(true)),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        if (!bet) {
            await interaction.reply("You need to specify a bet!");
            return;
        }
        const user = interaction.member;
        const data = await User.findOne({ id: user.id });
        if (data.money < bet) {
            await interaction.reply("You don't have enough money!");
            return;
        }
        if(bet <= 0) {
            await interaction.reply("You can't bet less than $1!");
            return;
        }

        
        data.money -= bet;
        await data.save();

        let playerCards = [];
        let dealerCards = [];

        const cards = {
            1: "A",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            10: "10",
            11: "J",
            12: "Q",
            13: "K",
        };
        const suits = {
            1: "Spades",
            2: "Clubs",
            3: "Diamonds",
            4: "Hearts",
        };

        class Card{
            
            constructor(card, suit){
                this.card = card;
                this.suit = suit;
            }
            
            getCardValue(){
                if (this.card === 1) return 11;
                if (this.card > 10) return 10;
                return this.card;
            }
            
            getCardName(){
                return `${cards[this.card]} of ${suits[this.suit]}`;
            }
            
        }

        function getCard(){
            return new Card(getRandomInt(13) + 1, getRandomInt(4) + 1);
        }

        function hit(hand){
            hand.push(getCard());
        }
        
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }
        
        function newEmbed(){
            return new EmbedBuilder()
            .setColor(0xaa00cc)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setTimestamp()
        }
        
        const startEmbed = newEmbed()
        .setTitle("Blackjack")
        .setDescription(`You have bet $${bet}!`)
        .addFields(
            {name:"Dealer", value: "??", inline: true},
            {name:"Player", value: "??", inline: true},
        )
        .setFooter({text: "Game starting in 5 seconds..."});

        hit(playerCards);
        hit(dealerCards);
        hit(playerCards);
        hit(dealerCards);

        let playerScore = playerCards.reduce((a, b) => a + b.getCardValue(), 0);
        let dealerScore = dealerCards.reduce((a, b) => a + b.getCardValue(), 0);

        const hitButton = new ButtonBuilder()
        .setCustomId("hit")
        .setLabel("Hit")
        .setStyle("Primary");

        const standButton = new ButtonBuilder()
        .setCustomId("stand")
        .setLabel("Stand")
        .setStyle("Primary");

        const doubleDownButton = new ButtonBuilder()
        .setCustomId("doubleDown")
        .setLabel("Double Down")
        .setStyle("Success");

        const row = new ActionRowBuilder()
        .addComponents(hitButton, standButton,doubleDownButton);

        const hitEmbed = ()=>newEmbed()
        .setTitle("Blackjack")
        .setDescription(`You have bet $${bet}!`)
        .addFields(
            {name:"Dealer", value: "??", inline: true},
            {name:"Player", value: `${playerCards.map(c=>c.getCardName()).join("\n")}\nScore: ${playerScore}`, inline: true},
        )
        .setFooter({text: "Hit or Stand?"});
        const msg = await interaction.reply("Starting game...");


        if(await checkWin()) return;

        await msg.edit({content: "Game on.", embeds: [hitEmbed()], components: [row]});
        const filter = i => i.user.id === user.id && (i.customId==="doubleDown"?data.money>=bet:true);
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        
        collector.on('collect', async i => {
            console.log(i)
            if(i.customId === "hit"){
                hit(playerCards);
                playerScore = playerCards.reduce((a, b) => a + b.getCardValue(), 0);
                if(await checkWin()===false){

                await i.update({content: "Game on.", embeds: [hitEmbed()], components: [row]});
                }
            }
            if(i.customId === "doubleDown"){
                hit(playerCards);
                playerScore = playerCards.reduce((a, b) => a + b.getCardValue(), 0);
                if(dealerScore < 17){
                    hit(dealerCards);
                    dealerScore = dealerCards.reduce((a, b) => a + b.getCardValue(), 0);
                }
                if(await checkWin()===false){
                    data.money -= bet;
                    return checkLoss()
                }

                    data.money += bet;
                    await data.save();
                
            }
            if(i.customId === "stand"){
                while(dealerScore < 17){
                    hit(dealerCards);
                    dealerScore = dealerCards.reduce((a, b) => a + b.getCardValue(), 0);
                }
                if(await checkWin()===false){
                checkLoss()
                }
            }
            

        });
        collector.on('end', collected => {
            if(collected.size === 0){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("You took too long to respond!");
                msg.edit({content: "Game over!", embeds: [endEmbed], components: []});
            }
        });
        function getEndEmbed(){
            const embed = newEmbed()
            .setTitle("Blackjack")
            .setDescription(`You have bet $${bet}!`)
            .addFields(
                {name:"Dealer", value: `${dealerCards.map(c=>c.getCardName()).join("\n")}\nScore: ${dealerScore}`, inline: true},
                {name:"Player", value: `${playerCards.map(c=>c.getCardName()).join("\n")}\nScore: ${playerScore}`, inline: true},
            )
            .setFooter({text: "Game over."});
            return embed
        }
         function checkWin(){
            const win = ()=>{data.money += bet * 2;return data.save();}
            if(playerScore > 21){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("You busted!");
                msg.edit({content: "Game over!", embeds: [endEmbed], components: []});
                return;
            }
            if(playerScore === 21){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("You got blackjack!");
                msg.edit({content: "You win!", embeds: [endEmbed], components: []});
                return win();
            }
            if(dealerScore > 21){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("Dealer busted!");
                msg.edit({content: "You win!", embeds: [endEmbed], components: []});
                return win();
            }
            if(dealerScore === 21){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("Dealer got blackjack!");
                msg.edit({content: "You lose!", embeds: [endEmbed], components: []});
                return;
            }
            return false;
        }
        function checkLoss(){
            const tie = ()=>{data.money += bet;return data.save();}
            if(dealerScore > playerScore){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("Dealer has a higher score!");
                msg.edit({content: "You lose!", embeds: [endEmbed], components: []});
                return;
            }
            if(dealerScore < playerScore){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("You have a higher score!");
                msg.edit({content: "You win!", embeds: [endEmbed], components: []});
                data.money += bet * 2;
                return data.save();
            }
            if(dealerScore === playerScore){
                const endEmbed = getEndEmbed();
                endEmbed.setDescription("You tied!");
                msg.edit({content: "You tie!", embeds: [endEmbed], components: []});
                return tie();
            }
        }


    }

};