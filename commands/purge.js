const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Delete a specified number of messages.')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('The number of messages to delete.')
				.setRequired(true)),
  	category: 'Moderation',

	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');

		if (amount <= 0 || amount > 1000) {
			return interaction.reply('Please provide a valid number of messages to delete (1-1000).');
		}

		// Check if the user has the ADMINISTRATOR permission
		const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');

		if (!isAdmin) {
			return interaction.reply('Only administrators can use this command.');
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
			await interaction.channel.bulkDelete(messages);

			const successEmbed = new MessageEmbed()
				.setColor(config.color.success)
				.setDescription(`Successfully deleted ${messages.size - 1} messages.`);

			await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

			// Log the purged messages
			const logEmbed = new MessageEmbed()
				.setColor(config.color.log)
				.setTitle('Messages Purged')
				.addFields(
					{ name: 'Channel', value: interaction.channel.toString() },
					{ name: 'Moderator', value: interaction.user.toString() },
					{ name: 'Number of Messages', value: (messages.size - 1).toString() }
				)
				.setTimestamp();

			const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'logs');
			if (logChannel) {
				logChannel.send({ embeds: [logEmbed] });
			}
		} catch (error) {
			console.error('Error purging messages:', error);
			await interaction.followUp('An error occurred while purging messages.');
		}
	},
};
