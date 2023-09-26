const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skin')
		.setDescription('Download Minecraft skin by username.')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('The Minecraft username to fetch the skin for.')
				.setRequired(true)),
  	category: 'Fun',

	async execute(interaction) {
		const username = interaction.options.getString('username');

		try {
			// Make a request to Mojang API to get the UUID of the player
			const uuidResponse = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
			const uuid = uuidResponse.data.id;

			// Get the skin texture from Crafatar API
			const skinResponse = await axios.get(`https://crafatar.com/renders/body/${uuid}`);
			const skinUrl = skinResponse.request.res.responseUrl;

			// Create an embed to display the skin
			const embed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(`${username}'s Minecraft Skin`)
				.setDescription(`**Username: ${username}**`)
				.setImage(skinUrl)
				.setFooter('Skin provided by Join For Rewards');

			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error('Error fetching skin:', error);
			await interaction.reply('Error fetching skin. Please try again later.');
		}
	},
};
