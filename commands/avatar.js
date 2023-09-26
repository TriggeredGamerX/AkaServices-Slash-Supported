const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Display the avatar of a user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user whose avatar you want to see.')
				.setRequired(true)),
  	category: 'Information',

	async execute(interaction) {
		const user = interaction.options.getUser('user');

		const avatarEmbed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle('Avatar')
			.setDescription(`Here is the avatar of ${user.tag}:`)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 256 })) // Display the user's avatar
			.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
			.setTimestamp();

		await interaction.reply({ embeds: [avatarEmbed] });
	},
};
