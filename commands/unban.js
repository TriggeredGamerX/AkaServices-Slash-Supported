const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a user from the server.')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('The user to unban (provide their ID).')
				.setRequired(true)
		),
  	category: 'Moderation',

	async execute(interaction) {
		const userId = interaction.options.getString('user');

		if (!interaction.member.permissions.has('BAN_MEMBERS')) {
			return interaction.reply('You do not have permission to use this command.');
		}

		try {
			const bannedUsers = await interaction.guild.bans.fetch();
			const bannedUser = bannedUsers.get(userId);

			if (!bannedUser) {
				return interaction.reply('User not found in the ban list.');
			}

			await interaction.guild.bans.remove(userId);

			const unbanEmbed = new MessageEmbed()
				.setColor(config.color.default)
				.setTitle('User Unbanned')
				.addField('User', `<@${userId}>`, true)
				.addField('Moderator', interaction.user.tag, true)
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();

			await interaction.reply({ embeds: [unbanEmbed] });
		} catch (error) {
			console.error(error);
			return interaction.reply('An error occurred while trying to unban the user.');
		}
	},
};
