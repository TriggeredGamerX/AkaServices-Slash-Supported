const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Display the top users with the highest coin balances.')
    .addIntegerOption((option) =>
      option.setName('limit')
        .setDescription('The number of users to display on the leaderboard.')
        .setRequired(false)
    ),
  	category: 'Economy',

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10; // Default limit is 10 users

    // Ensure the limit is within a reasonable range (e.g., between 1 and 100)
    const validLimit = Math.min(Math.max(limit, 1), 100);

    // Retrieve the top users based on their coin balances
    db.all('SELECT user_id, balance FROM economy ORDER BY balance DESC LIMIT ?', validLimit, (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while fetching the leaderboard.');
      }

      const leaderboardEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Leaderboard')
        .setDescription(`Top ${validLimit} users with the highest coin balances:`);

      // Add users to the embed with their usernames
      for (let i = 0; i < rows.length; i++) {
        const userId = rows[i].user_id;
        const username = interaction.guild.members.cache.get(userId)?.user.username || 'Unknown User'; // Get the username

        leaderboardEmbed.addField(`${i + 1}. ${username}`, `Coins: ${rows[i].balance}`);
      }

      interaction.reply({ embeds: [leaderboardEmbed] });
    });
  },
};
