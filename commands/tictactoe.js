const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const User = require("../models/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Challenge someone in a battle of tic tac toe! Winner takes the money!')
        .addUserOption(option => option.setName('user').setDescription('The user you want to challenge').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of money you want to bet').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        let recieverData = await User.findOne({ id:  user.id});
        let senderData = await User.findOne({ id:  interaction.user.id});
        if (!senderData) senderData = await User.create({ id: interaction.user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });
        if (!recieverData) recieverData = await User.create({ id: user.id, money: 0, bank: 0, lastDaily: 0, lastWork: 0, lastRob: 0, lastCrime: 0, lastWeekly: 0, lastMonthly: 0 });

        if(user.id === interaction.user.id) {
            await interaction.reply({content: "You can't challenge yourself!", ephemeral: true});
            return;
        }

        if (amount > recieverData.money) {
            await interaction.reply({content: "They don't have enough money to bet that much!", ephemeral: true});
            return;
        }
        

        if (amount > senderData.money) {
            await interaction.reply({content: "You don't have enough money to bet that much!", ephemeral: true});
            return;
        }

        if (amount <= 0) {
            await interaction.reply({content: "You can't bet less than $1!", ephemeral: true});
            return;
        }

        await interaction.reply({content: `You challenged ${user.username} to a game of tic tac toe!`});
        const msg = await interaction.followUp({content: `${user.username}, do you accept?`});
        const emojis = ["✅","❌"]
        for await (const emoji of emojis) {
            await msg.react(emoji)
        }

        const filter = (reaction, u) => {
            return emojis.includes(reaction.emoji.name) && u.id === user.id;
        };
        const collector = msg.createReactionCollector({ filter, time: 15000 });
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === "✅") {
                msg.edit("Game accepted!")
                startGame()
            } else if (reaction.emoji.name === "❌") {
                msg.edit("Game declined!")
            }
        });


        const gameData = {
            board: ["","","","","","","","",""],
            emojis: ["❌","⭕"],
            turn: Math.round(Math.random()),
            winner: null,
            players: [interaction.user, user],
            money: amount
        }
        async function startGame(){
            //take money from both users
            recieverData.money -= amount
            senderData.money -= amount
            await recieverData.save()
            await senderData.save()

            // use discord slash command buttons
            const buttons = []
            for (let i = 0; i < 9; i++) {
                buttons.push(new ButtonBuilder().setCustomId(i+"").setLabel("?").setStyle("Secondary"))
            }
            const rows = [new ActionRowBuilder().addComponents(buttons.slice(0,3)), new ActionRowBuilder().addComponents(buttons.slice(3,6)), new ActionRowBuilder().addComponents(buttons.slice(6,9))]
            const msg = await interaction.followUp({content: `${gameData.emojis[gameData.turn]+gameData.players[gameData.turn].username}'s turn `, components: rows})
            const filter = (interaction) => {
                return interaction.user.id === gameData.players[gameData.turn].id && !gameData.board[parseInt(interaction.customId)];

            }

            const getChoice = async () => {
                const component = await msg.awaitMessageComponent({ filter, time: 60000 });
            gameData.board[parseInt(component.customId)] = gameData.emojis[gameData.turn]
                buttons[parseInt(component.customId)].setLabel(gameData.emojis[gameData.turn]).setStyle("Primary")
                gameData.turn = gameData.turn === 0 ? 1 : 0

                component.update({content: `${gameData.emojis[gameData.turn]+gameData.players[gameData.turn].username}'s turn `, components: rows})
                await checkWin()||await getChoice()
            }
            getChoice()

            async function checkWin(){
                const winConditions = [
                    [0,1,2],
                    [3,4,5],
                    [6,7,8],
                    [0,3,6],
                    [1,4,7],
                    [2,5,8],
                    [0,4,8],
                    [2,4,6]
                ]
                for await(const condition of winConditions) {
                    const pos1 = gameData.board[condition[0]]
                    const pos2 = gameData.board[condition[1]]
                    const pos3 = gameData.board[condition[2]]
                    if (pos1 === pos2 && pos2 === pos3 && pos1 !== "") {
                        gameData.winner = gameData.turn === 0 ? 1 : 0
                        // give money to winner
                        if (gameData.winner === 0) {
                            senderData.money += amount*2
                            await senderData.save()
                        } else {
                            recieverData.money += amount*2
                            await recieverData.save()
                        }

                        end()

                        return true
                    }
                }
                if (!gameData.board.includes("")) {
                    gameData.winner = "draw"
                    // give money back to both users
                    recieverData.money += amount
                    senderData.money += amount
                    await recieverData.save()
                    await senderData.save()

                    end()
                    return true
                }
                return false
            }
            function end(){
                if (gameData.winner === "draw") {
                    msg.edit({content: "It's a draw! Bet has been given back to both users", components: []})

                } else {
                    msg.edit({content: `${gameData.players[gameData.winner].username} won the game! They have been given $${amount*2}`})
                }
            }

        }

            

    },
};