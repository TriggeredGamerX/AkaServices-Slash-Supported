const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listguilds')
		.setDescription('List all the guilds the bot is a member of.'),
  	category: 'Owner',

	async execute(interaction) {
		// Check if the command is executed by the bot owner (replace 'YOUR_OWNER_ID' with the actual owner's ID)
		if (interaction.user.id !== '1063691309782675566') {
			return interaction.reply('You are not authorized to use this command.');
		}

		const guilds = interaction.client.guilds.cache;

		const embed = new MessageEmbed()
			.setColor('#00ff00')
			.setTitle('List of Guilds')
			.setDescription(`Total Guilds: ${guilds.size}`)
			.addField('Server Name', guilds.map(guild => guild.name).join('\n'), true)
			.addField('Server ID', guilds.map(guild => guild.id).join('\n'), true)
			.setFooter('Bot by Your Name', interaction.client.user.displayAvatarURL())
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};
