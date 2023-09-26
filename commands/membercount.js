const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('membercount')
		.setDescription('Get the member count of the server.'),
  	category: 'Server',

	async execute(interaction) {
		const guild = interaction.guild;
		const memberCount = guild.memberCount;

		const formattedCount = `<:members:1124383073660833982> **__Total Members__: ${memberCount}**`;

		const embed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle(`${guild.name} Member Count`)
			.setDescription(formattedCount)
			.setImage(config.banner);

		await interaction.reply({ embeds: [embed] });
	},
};
