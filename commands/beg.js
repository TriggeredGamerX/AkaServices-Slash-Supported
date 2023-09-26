const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for cooldowns
const dbCooldowns = new sqlite3.Database('cooldowns.db');

// Connect to the SQLite database for economy
const dbEconomy = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for some coins.'),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;

    // Check if the user is on cooldown for the /beg command
    dbCooldowns.get('SELECT * FROM cooldowns WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking cooldowns.');
      }

      // Calculate the cooldown duration (1 hour in milliseconds)
      const cooldownDuration = 60 * 60 * 1000;

      // Check if the user is on cooldown
      if (row && Date.now() - row.timestamp < cooldownDuration) {
        const remainingCooldown = cooldownDuration - (Date.now() - row.timestamp);
        const minutes = Math.ceil(remainingCooldown / 60000);

        return interaction.reply(`You're on cooldown. You can beg again in ${minutes} minutes.`);
      }

      // Determine the amount of coins the user receives (random between 1 and 50 coins)
      const begCoins = Math.floor(Math.random() * 50) + 1;

      // Update the user's balance in the database
      dbEconomy.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, COALESCE((SELECT balance FROM economy WHERE user_id = ?), 0) + ?)', [userId, userId, begCoins], (economyErr) => {
        if (economyErr) {
          console.error(economyErr);
          return interaction.reply('An error occurred while granting your coins.');
        }

        // Update the user's cooldown timestamp in the cooldowns database
        const currentTime = Date.now();
        dbCooldowns.run('INSERT OR REPLACE INTO cooldowns (user_id, timestamp) VALUES (?, ?)', [userId, currentTime]);

        interaction.reply(`You received ${begCoins} coins by begging!`);
      });
    });
  },
};
