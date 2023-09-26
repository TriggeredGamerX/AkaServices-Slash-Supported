const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display detailed help for a specific command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want help with.')
                .setRequired(false)),
    	category: 'Help Menu',


    async execute(interaction) {
        const { commands } = interaction.client;
        const commandName = interaction.options.getString('command');

        const requesterAvatar = interaction.user.displayAvatarURL({ dynamic: true, size: 64 });
        const botAvatar = interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 });

        if (!commandName) {
            // If no specific command is provided, display a list of available commands
            const categories = new Map();

            commands.forEach(command => {
                const category = command.category || 'Uncategorized';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push(`/${command.data.name} - ${command.data.description || 'No description available.'}`);
            });

            const helpEmbed = new MessageEmbed()
                .setColor(config.color.default)
                .setTitle('Available Commands ');

            categories.forEach((commandList, category) => {
                helpEmbed.addField(category, commandList.join('\n'));
            });

            helpEmbed.setFooter(`Requested by: ${interaction.user.tag}`, requesterAvatar);

            // Create a button linking to the dashboard
            const dashboardButton = new MessageButton()
                .setLabel('Dashboard')
                .setURL(config.website)
                .setStyle('LINK');

            // Create an action row to contain the button
            const row = new MessageActionRow().addComponents(dashboardButton);

            await interaction.reply({ embeds: [helpEmbed], components: [row] });
        } else {
            // If a specific command is provided, display details about that command
            const command = commands.get(commandName);

            if (!command) {
                await interaction.reply('Command not found.');
                return;
            }

            const commandEmbed = new MessageEmbed()
                .setColor(config.color.default)
                .setTitle(`Command Help: ${command.data.name}`)
                .setDescription(command.data.description || 'No description available.')
                .addField('Usage', `/${command.data.name}`)
                .addField('Category', command.category || 'Uncategorized')
                .setFooter(`Requested by: ${interaction.user.tag}`, requesterAvatar);

            await interaction.reply({ embeds: [commandEmbed] });
        }
    },
};
