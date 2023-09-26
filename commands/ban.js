const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user from the server.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to ban.')
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for the ban.')
		),
  	category: 'Moderation',

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || 'No reason provided';

		if (!interaction.member.permissions.has('BAN_MEMBERS')) {
			return interaction.reply('You do not have permission to use this command.');
		}

		const member = interaction.guild.members.cache.get(user.id);
		if (!member) {
			return interaction.reply('The specified user was not found in this server.');
		}

		if (!member.bannable) {
			return interaction.reply('I cannot ban this user.');
		}

		await member.ban({ reason });

		const banEmbed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle('User Banned')
			.addField('User', user.tag, true)
			.addField('Moderator', interaction.user.tag, true)
			.addField('Reason', reason)
			.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
			.setTimestamp();

		await interaction.reply({ embeds: [banEmbed] });
	},
};
