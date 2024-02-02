const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription(`I can roll a die for you! 🎲 In my bag, I have the following dice: D4, D6, D8, D10, D12 and D20.`)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of die to roll.')
                .setRequired(true)
                .addChoices(
                    { name: 'D4', value: '4' },
                    { name: 'D6', value: '6' },
                    { name: 'D8', value: '8' },
                    { name: 'D10', value: '10' },
                    { name: 'D12', value: '12' },
                    { name: 'D20', value: '20' }
                ))
    ,
    async execute(interaction) {
        const roll = (type, sides) => {
            min = Math.ceil(1)
            max = Math.floor(sides)
            rollResult = Math.floor(Math.random() * (max - min + 1)) + min
            interaction.reply({ content: `Using a ${type} 🎲, you rolled a ${rollResult}!` })
        }

        switch (interaction.options.getString('type')){
            case '4':
                roll('D4', 4)
                break
            case '6':
                roll('D6', 6)
                break
            case '8':
                roll('D8', 8)
                break
            case '10':
                roll('D10', 10)
                break
            case '12':
                roll('D12', 12)
                break
            case '20':
                roll('D20', 20)
                break
        }
        
    },
    description: `I can roll a die for you! 🎲 In my bag, I have the following dice: D4, D6, D8, D10, D12 and D20.`
};