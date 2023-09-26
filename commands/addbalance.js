const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addbalance')
    .setDescription('Add coins to a user\'s balance')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to add coins to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of coins to add')
        .setRequired(true)),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;
    const userToAddBalance = interaction.options.getUser('user');
    const amountToAdd = interaction.options.getInteger('amount');

    // Check if the user has administrator permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      const permissionEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Permission Denied')
        .setDescription('You must have administrator permissions to use this command.');

      return interaction.reply({ embeds: [permissionEmbed] });
    }

    // Update the user's balance in the database
    db.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, COALESCE((SELECT balance FROM economy WHERE user_id = ?), 0) + ?)', [userToAddBalance.id, userToAddBalance.id, amountToAdd], (err) => {
      if (err) {
        console.error(err);
        const errorEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('An error occurred while adding balance to the user.');

        return interaction.reply({ embeds: [errorEmbed] });
      }

      const successEmbed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Balance Added')
        .setDescription(`Added ${amountToAdd} coins to ${userToAddBalance.tag}'s balance.`);

      interaction.reply({ embeds: [successEmbed] });
    });
  },
};
