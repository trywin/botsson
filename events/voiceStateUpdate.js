const User = require("../models/User");
module.exports = {
    name: 'voiceStateUpdate',
    async execute(client, oldState, newState) {
        const user = newState.member;
        const userData = await User.findOne({ id: user.id });
        if(newState.channelId === "1089552250755616842" && userData.grantedAccess === true){
            // move user to voice channel with specific ID
            const channel = newState.guild.channels.cache.get("1089954959333789726");
            user.voice.setChannel(channel);

            userData.grantedAccess = false;
            await userData.save();
            
        }
        if (oldState.channelId === null && newState.channelId === "1089954959333789726") {
            const channel = newState.guild.channels.cache.get("1090291774066532482");
            const member = newState.member;
            const roles = ["1089553569784545401","1089552847261143181"]
            const role = member.roles.cache.find(r=>roles.includes(r.id))
            if(role && newState.channel.members.size===1){
                const msg = await channel.send({content: `<@${member.id}> invite hood niggas? 🙏🏿🙏🏿`});
                await msg.react("✅")
                await msg.react("❌")
                const filter = (reaction, user) => {
                    return ["✅","❌"].includes(reaction.emoji.name) && user.id === member.id;
                };
                
                const collector = msg.createReactionCollector({ filter, max:1, time: 15000 });
                
                collector.on('collect', (reaction, user) => {
                    msg.delete().catch(e=>e)
                    if(reaction.emoji.name==="✅"){
                        channel.send(`${roles.map(r=>`<@&${r}>`)}‼️`)
                    }
                });
                collector.on("end", ()=>{
                    msg.delete().catch(e=>e);
                })
            }
        }
    },
};