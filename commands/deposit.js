const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins to your bank.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount of coins to deposit.')
        .setRequired(true)),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply('Please enter a valid deposit amount greater than zero.');
    }

    // Check if the user has enough coins in their balance
    db.get('SELECT balance FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking your balance.');
      }

      const balance = row ? row.balance : 0;

      if (balance < amount) {
        return interaction.reply('You don\'t have enough coins to deposit that amount.');
      }

      // Update the user's balance and bank balance
      db.run('UPDATE economy SET balance = balance - ?, bank = bank + ? WHERE user_id = ?', [amount, amount, userId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return interaction.reply('An error occurred while processing your deposit.');
        }

        const depositEmbed = new MessageEmbed()
          .setColor('#3498db')
          .setTitle('Deposit Successful')
          .setDescription(`You have successfully deposited ${amount} coins into your bank.`);

        interaction.reply({ embeds: [depositEmbed] });
      });
    });
  },
};
