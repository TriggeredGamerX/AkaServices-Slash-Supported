const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const config = require('../config.json'); // Import your configuration file

// Define your support category ID
const supportCategoryId = config.supportCategoryId;
const closedTicketsCategoryId = config.closedTicketsCategoryId;
const logChannelId = config.logChannelId;
let isSetup = false; // Flag to track if setup has been done

// Define an object to store ticket data
const tickets = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new support ticket')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Set up the support ticket system')
        .addStringOption(option => option.setName('category').setDescription('Name of the ticket category'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a support ticket')
        .addChannelOption(option => option.setName('channel').setDescription('Ticket channel to delete'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('claim')
        .setDescription('Claim a support ticket')
        .addChannelOption(option => option.setName('channel').setDescription('Ticket channel to claim'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all support tickets')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close your support ticket')
        .addChannelOption(option => option.setName('channel').setDescription('Ticket channel to close'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reopen')
        .setDescription('Reopen a closed support ticket')
        .addChannelOption(option => option.setName('channel').setDescription('Ticket channel to reopen'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a user to the support ticket')
        .addUserOption(option => option.setName('user').setDescription('User to add'))
    ),
  	category: 'Tickets',
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.user;
    const guild = interaction.guild;

    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel || logChannel.type !== 'GUILD_TEXT') {
      await interaction.reply('Log channel is not set up correctly.');
      return;
    }

    if (subcommand === 'create') {
      // Check if the support category exists
      if (!supportCategoryId) {
        await interaction.reply('The support ticket system is not set up. Use `/ticket setup` to set it up.');
        return;
      }

      const supportCategory = guild.channels.cache.get(supportCategoryId);

      if (!supportCategory || supportCategory.type !== 'GUILD_CATEGORY') {
        await interaction.reply('Support category is not set up correctly.');
        return;
      }

      // Check if the user already has a ticket
      if (tickets[user.id]) {
        await interaction.reply('You already have an active support ticket.');
        return;
      }

      // Create a new ticket channel
      const ticketChannel = await guild.channels.create(`ticket-${user.id}`, {
        type: 'text',
        parent: supportCategory,
        permissionOverwrites: [
          {
            id: user.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
          },
          {
            id: guild.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          },
        ],
      });

      // Send initial message with ticket name, questions, and status
      const initialMessage = await ticketChannel.send({
        content: `Welcome to your support ticket, ${user} in ${ticketChannel}!\n\nPlease answer the following questions:\n\n1. Your Name:\n2. Reason for the Ticket:\n3. Describe the Issue:`,
      });

      // Store the ticket data
      tickets[user.id] = {
        channelId: ticketChannel.id,
        claimedBy: null,
        initialMessageId: initialMessage.id,
        users: [user.id], // Store the user who created the ticket
      };

      await interaction.reply(`Your support ticket has been created in ${ticketChannel}`);

      // Log ticket creation
      const logEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Support Ticket Created')
        .setDescription(`A new support ticket has been created by ${user}`)
        .addField('User', user.toString())
        .addField('Ticket Channel', ticketChannel.toString());

      logChannel.send({ embeds: [logEmbed] });
    } else if (subcommand === 'setup') {
      // Check if the setup has already been done
      if (isSetup) {
        await interaction.reply('The support ticket system has already been set up.');
        return;
      }

      // Check if the user has the necessary permissions to set up the system
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to set up the support ticket system.');
        return;
      }

      // Get the category name from the interaction options
      const categoryName = interaction.options.getString('category');

      // Create a support category if not already created
      const category = guild.channels.cache.find(
        (c) => c.type === 'GUILD_CATEGORY' && c.id === supportCategoryId
      );

      if (!category) {
        await interaction.reply(`Category with ID ${supportCategoryId} not found.`);
        return;
      }

      // Mark setup as done
      isSetup = true;

      await interaction.reply('The support ticket system has been set up successfully.');
    } else if (subcommand === 'delete') {
      // Check if the user has permission to delete tickets
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to delete support tickets.');
        return;
      }

      const ticketChannel = interaction.options.getChannel('channel');

      if (!ticketChannel || ticketChannel.type !== 'GUILD_TEXT') {
        await interaction.reply('Invalid ticket channel provided.');
        return;
      }

      const userId = Object.keys(tickets).find(userId => tickets[userId].channelId === ticketChannel.id);

      if (!userId) {
        await interaction.reply('This channel is not a support ticket.');
        return;
      }

      // Delete the ticket channel
      await ticketChannel.delete();

      // Remove the ticket data
      delete tickets[userId];

      await interaction.reply('The support ticket has been deleted.');

      // Log ticket deletion
      const logEmbed = new MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('Support Ticket Deleted')
        .setDescription(`A support ticket has been deleted by ${user}`)
        .addField('User', user.toString())
        .addField('Ticket Channel', ticketChannel.toString());

      logChannel.send({ embeds: [logEmbed] });
    } else if (subcommand === 'claim') {
      // Check if the user has permission to claim tickets
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to claim support tickets.');
        return;
      }

      const ticketChannel = interaction.options.getChannel('channel');

      if (!ticketChannel || ticketChannel.type !== 'GUILD_TEXT') {
        await interaction.reply('Invalid ticket channel provided.');
        return;
      }

      const userId = Object.keys(tickets).find(userId => tickets[userId].channelId === ticketChannel.id);

      if (!userId) {
        await interaction.reply('This channel is not a support ticket.');
        return;
      }

      // Claim the ticket
      tickets[userId].claimedBy = user.id;

      // Send a message indicating the ticket has been claimed
      await interaction.reply(`You have claimed the support ticket in ${ticketChannel}.`);

      // You can add more logic here, like notifying the user who created the ticket

      // Log ticket claiming
      const logEmbed = new MessageEmbed()
        .setColor('#27ae60')
        .setTitle('Support Ticket Claimed')
        .setDescription(`A support ticket has been claimed by ${user}`)
        .addField('User', user.toString())
        .addField('Ticket Channel', ticketChannel.toString());

      logChannel.send({ embeds: [logEmbed] });
    } else if (subcommand === 'list') {
      // Check if the user has permission to list tickets
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to list support tickets.');
        return;
      }

      // Create an embed to display all tickets
      const embed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Support Tickets')
        .setDescription('Here are all the support tickets:')
        .addFields(
          Object.entries(tickets).map(([userId, ticketData]) => ({
            name: `Ticket ID: ${userId}`,
            value: `Claimed by: ${ticketData.claimedBy ? `<@${ticketData.claimedBy}>` : 'Unclaimed'}`,
          }))
        );

      await interaction.reply({ embeds: [embed] });
    } else if (subcommand === 'close') {
      // Check if the user has permission to close tickets
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to close support tickets.');
        return;
      }

      const ticketChannel = interaction.options.getChannel('channel');

      if (!ticketChannel || ticketChannel.type !== 'GUILD_TEXT') {
        await interaction.reply('Invalid ticket channel provided.');
        return;
      }

      const userId = Object.keys(tickets).find(userId => tickets[userId].channelId === ticketChannel.id);

      if (!userId) {
        await interaction.reply('This channel is not a support ticket.');
        return;
      }

      // Close the ticket
      await ticketChannel.setParent(closedTicketsCategoryId); // Move to closed tickets category

      // Remove the ticket data
      delete tickets[userId];

      await interaction.reply('The support ticket has been closed and moved to the closed tickets category.');

      // Log ticket closure
      const logEmbed = new MessageEmbed()
        .setColor('#e74c3c')
        .setTitle('Support Ticket Closed')
        .Description(`A support ticket has been closed by ${user}`)
        .addField('User', user.toString())
        .addField('Ticket Channel', ticketChannel.toString());

      logChannel.send({ embeds: [logEmbed] });
    } else if (subcommand === 'reopen') {
      // Check if the user has permission to reopen tickets
      if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        await interaction.reply('You do not have permission to reopen support tickets.');
        return;
      }

      const ticketChannel = interaction.options.getChannel('channel');

      if (!ticketChannel || ticketChannel.type !== 'GUILD_TEXT') {
        await interaction.reply('Invalid ticket channel provided.');
        return;
      }

      const userId = Object.keys(tickets).find(userId => tickets[userId].channelId === ticketChannel.id);

      if (!userId) {
        await interaction.reply('This channel is not a support ticket.');
        return;
      }

      // Reopen the ticket by resetting the claimedBy field
      tickets[userId].claimedBy = null;

      await interaction.reply('The support ticket has been reopened.');

      // Log ticket reopening
      const logEmbed = new MessageEmbed()
        .setColor('#27ae60')
        .setTitle('Support Ticket Reopened')
        .setDescription(`A support ticket has been reopened by ${user}`)
        .addField('User', user.toString())
        .addField('Ticket Channel', ticketChannel.toString());

      logChannel.send({ embeds: [logEmbed] });
    } else if (subcommand === 'add') {
      // Check if the user has an active ticket
      if (!tickets[user.id]) {
        await interaction.reply('You do not have an active support ticket to add users to.');
        return;
      }

      const targetUser = interaction.options.getUser('user');

      if (!targetUser) {
        await interaction.reply('Invalid user provided.');
        return;
      }

      // Check if the mentioned user is already on the ticket
      if (tickets[user.id].users.includes(targetUser.id)) {
        await interaction.reply('The user is already on the support ticket.');
        return;
      }

      // Add the user to the ticket
      tickets[user.id].users.push(targetUser.id);

      await interaction.reply(`User ${targetUser} has been added to the support ticket.`);

      // Log user addition to ticket
      const logEmbed = new MessageEmbed()
        .setColor('#f39c12')
        .setTitle('User Added to Support Ticket')
        .setDescription(`A user has been added to a support ticket by ${user}`)
        .addField('User', user.toString())
        .addField('Added User', targetUser.toString())
        .addField('Ticket Channel', `Ticket ID: ${user.id}`);

      logChannel.send({ embeds: [logEmbed] });
    }
  },
};
