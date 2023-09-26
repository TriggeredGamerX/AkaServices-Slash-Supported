const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json'); // Import your config file

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user for rule violations.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to report.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the report.')
        .setRequired(true)
    ),
  	category: 'Utility',

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const reporter = interaction.user;

    // Check if the reported user is not a bot and not the reporter themselves
    if (user.bot || user.id === reporter.id) {
      return interaction.reply('You cannot report bots or yourself.');
    }

    // Get the reporting channel by ID from the config
    const reportingChannelId = config.reportschannelid;
    const reportingChannel = interaction.guild.channels.cache.get(reportingChannelId);

    if (!reportingChannel) {
      return interaction.reply('The reporting channel does not exist. Please contact a moderator or admin.');
    }

    const reportEmbed = new MessageEmbed()
      .setColor('#ff0000') // Red
      .setTitle('User Report')
      .setDescription(`Reported by: ${reporter.tag}`)
      .addField('Reported User', `${user.tag} (${user.id})`, true)
      .addField('Reason', reason, true)
      .setFooter({
        text: `Reported at ${new Date().toLocaleString()}`,
        iconURL: reporter.displayAvatarURL(),
      })
      .setTimestamp();

    reportingChannel.send({ embeds: [reportEmbed] });

    // Create a reply embed
    const replyEmbed = new MessageEmbed()
      .setColor('#00ff00') // Green
      .setTitle('Report Submitted')
      .setDescription('Your report has been submitted successfully.')
      .addField('Reported User', user.tag, true)
      .addField('Reason', reason, true)
      .setFooter({
        text: `Reported at ${new Date().toLocaleString()}`,
        iconURL: reporter.displayAvatarURL(),
      })
      .setTimestamp();

    // Provide confirmation to the user with the reply embed
    interaction.reply({ embeds: [replyEmbed] });
  },
};
