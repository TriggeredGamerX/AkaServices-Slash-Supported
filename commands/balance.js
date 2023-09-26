const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance.'),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;

    // Check the user's balance from the database
    db.get('SELECT balance FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while fetching your balance.');
      }

      const balance = row ? row.balance : 0;

      const balanceEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Balance')
        .setDescription(`Your balance is: ${balance} coins`);

      interaction.reply({ embeds: [balanceEmbed] });
    });
  },
};
