const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bankleaderboard')
    .setDescription('Display the bank leaderboard.'),
  	category: 'Economy',

  async execute(interaction) {
    db.all('SELECT user_id, bank FROM economy ORDER BY bank DESC LIMIT 10', (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while fetching the bank leaderboard.');
      }

      const leaderboardEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Bank Leaderboard')
        .setDescription('Top 10 users with the highest bank balances.');

      rows.forEach((row, index) => {
        const userTag = interaction.client.users.cache.get(row.user_id)?.tag || 'Unknown User';
        leaderboardEmbed.addField(`#${index + 1} ${userTag}`, `Bank: ${row.bank} coins`);
      });

      return interaction.reply({ embeds: [leaderboardEmbed] });
    });
  },
};
