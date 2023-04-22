const {ActivityType} = require('discord.js');
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setActivity('with your mother', { type: ActivityType.Playing });
        client.user.setStatus("dnd")
        const commands = await client.application?.commands.fetch();
        client.commands.forEach(async command => {
            if (!commands.some(c => c.name === command.data.name)) {
                await client.application?.commands.create(command.data);
                console.log(`Registered global slash command: ${command.data.name}`	)
            }
            else {
                //update command
                await client.application?.commands.edit(commands.find(c=>c.name===command.data.name).id, command.data);
                console.log(`Global slash command updated: ${command.data.name}`)
            }
        });
    },
}