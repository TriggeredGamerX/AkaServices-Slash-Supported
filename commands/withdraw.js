const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from your bank.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of coins to withdraw.')
        .setRequired(true)),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply('Please enter a valid withdrawal amount greater than zero.');
    }

    // Check the user's bank balance
    db.get('SELECT bank FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking your bank balance.');
      }

      const bankBalance = row ? row.bank : 0;

      if (bankBalance < amount) {
        return interaction.reply('You don\'t have enough coins in your bank to withdraw that amount.');
      }

      // Update the user's balance and bank balance
      db.run('UPDATE economy SET balance = balance + ?, bank = bank - ? WHERE user_id = ?', [amount, amount, userId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return interaction.reply('An error occurred while processing your withdrawal.');
        }

        const withdrawEmbed = new MessageEmbed()
          .setColor('#3498db')
          .setTitle('Withdrawal Successful')
          .setDescription(`You have successfully withdrawn ${amount} coins from your bank.`);

        interaction.reply({ embeds: [withdrawEmbed] });
      });
    });
  },
};
