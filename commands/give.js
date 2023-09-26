const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give coins to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give coins to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of coins to give')
        .setRequired(true)),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;
    const userToReceive = interaction.options.getUser('user');
    const amountToGive = interaction.options.getInteger('amount');

    // Check if the user has enough balance
    db.get('SELECT balance FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        const errorEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Error')
          .setDescription('An error occurred while fetching your balance.');

        return interaction.reply({ embeds: [errorEmbed] });
      }

      const userBalance = row ? row.balance : 0;

      if (userBalance < amountToGive) {
        const insufficientBalanceEmbed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle('Insufficient Balance')
          .setDescription('You do not have enough coins to give.');

        return interaction.reply({ embeds: [insufficientBalanceEmbed] });
      }

      // Deduct the given amount from the user's balance
      const newBalance = userBalance - amountToGive;

      db.run('UPDATE economy SET balance = ? WHERE user_id = ?', [newBalance, userId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          const updateErrorEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('An error occurred while updating your balance.');

          return interaction.reply({ embeds: [updateErrorEmbed] });
        }

        // Add the given amount to the receiving user's balance
        db.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, COALESCE((SELECT balance FROM economy WHERE user_id = ?), 0) + ?)', [userToReceive.id, userToReceive.id, amountToGive], (giveErr) => {
          if (giveErr) {
            console.error(giveErr);
            const giveErrorEmbed = new MessageEmbed()
              .setColor('#ff0000')
              .setTitle('Error')
              .setDescription('An error occurred while giving coins to the user.');

            return interaction.reply({ embeds: [giveErrorEmbed] });
          }

          const successEmbed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Coins Given')
            .setDescription(`You gave ${amountToGive} coins to ${userToReceive.tag}.`);

          interaction.reply({ embeds: [successEmbed] });
        });
      });
    });
  },
};
