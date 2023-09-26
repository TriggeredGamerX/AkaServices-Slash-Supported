const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('Shows information about the server.'),
  	category: 'Server',

	async execute(interaction) {
		const { guild } = interaction;

		const owner = guild.members.cache.get(guild.ownerId);
		const afkChannel = guild.afkChannel || 'None';
		const verificationLevel = guild.verificationLevel;
		const serverIcon = guild.iconURL();
		const totalChannels = guild.channels.cache.size;
		const textChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_TEXT').size;
		const voiceChannels = guild.channels.cache.filter((channel) => channel.type === 'GUILD_VOICE').size;
		const afkTimeout = guild.afkTimeout;
		const totalRoles = guild.roles.cache.size;
		const totalEmojis = guild.emojis.cache.size;
		const totalMembers = guild.memberCount;
		const humanMembers = guild.members.cache.filter((member) => !member.user.bot).size;
		const botMembers = guild.members.cache.filter((member) => member.user.bot).size;
		const joinedAt = moment(owner.joinedAt).format('dddd, MMMM Do YYYY, h:mm:ss A');
		const createdAt = moment(guild.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss A');

		const serverEmbed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Server Information')
			.addFields(
				{ name: 'General Info', value: `Owner: ${owner}\nVerification Level: ${verificationLevel}` },
				{ name: 'Overview', value: `Total Channels: ${totalChannels}\nText Channels: ${textChannels}\nVoice Channels: ${voiceChannels}\nAFK Channel: ${afkChannel}\nAFK Timeout: ${afkTimeout} sec\nTotal Roles: ${totalRoles}\nTotal Emojis: ${totalEmojis}` },
				{ name: 'Member Info', value: `Total Members: ${totalMembers}\nHumans: ${humanMembers}\nBots: ${botMembers}` },
				{ name: 'Misc. Info', value: `You Joined on:\n${joinedAt}\nCreated On:\n${createdAt}` }
			)
			.setThumbnail(serverIcon)
			.setTimestamp();

		await interaction.reply({ embeds: [serverEmbed] });
	},
};
