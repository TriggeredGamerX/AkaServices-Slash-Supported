const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetbalance')
    .setDescription('Reset a user\'s balance')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user whose balance will be reset')
        .setRequired(true)),
  	category: 'Moderation',

  async execute(interaction) {
    const userId = interaction.user.id;
    const userToResetBalance = interaction.options.getUser('user');

    // Check if the user has administrator permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      const permissionEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Permission Denied')
        .setDescription('You must have administrator permissions to use this command.');

      return interaction.reply({ embeds: [permissionEmbed] });
    }

    // Reset the user's balance in the database
    db.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, 0)', [userToResetBalance.id], (err) => {
      if (err) {
        console.error(err);
        const errorEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('An error occurred while resetting the user\'s balance.');

        return interaction.reply({ embeds: [errorEmbed] });
      }

      const successEmbed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Balance Reset')
        .setDescription(`Reset ${userToResetBalance.tag}'s balance to 0 coins.`);

      interaction.reply({ embeds: [successEmbed] });
    });
  },
};
