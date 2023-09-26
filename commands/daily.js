const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for cooldowns
const dbCooldowns = new sqlite3.Database('cooldowns.db', (err) => {
  if (err) {
    console.error('Error connecting to cooldowns database:', err.message);
  } else {
    console.log('Connected to cooldowns database.');

    // Create the "cooldowns" table if it doesn't exist
    dbCooldowns.run(`
      CREATE TABLE IF NOT EXISTS cooldowns (
        user_id TEXT PRIMARY KEY,
        timestamp INTEGER
      )
    `);
  }
});

// Connect to the SQLite database for economy
const dbEconomy = new sqlite3.Database('economy.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily coins.'),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;

    // Check if the user is on cooldown for the /daily command
    dbCooldowns.get('SELECT * FROM cooldowns WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking cooldowns.');
      }

      // Calculate the cooldown duration (24 hours in milliseconds)
      const cooldownDuration = 24 * 60 * 60 * 1000;

      // Check if the user is on cooldown
      if (row && Date.now() - row.timestamp < cooldownDuration) {
        const remainingCooldown = cooldownDuration - (Date.now() - row.timestamp);
        const hours = Math.floor(remainingCooldown / 3600000);
        const minutes = Math.floor((remainingCooldown % 3600000) / 60000);

        return interaction.reply(`You can claim your daily coins again in ${hours} hours and ${minutes} minutes.`);
      }

      // Determine the amount of daily coins (e.g., 100 coins)
      const dailyCoins = 100;

      // Update the user's balance in the database
      dbEconomy.run('INSERT OR REPLACE INTO economy (user_id, balance) VALUES (?, COALESCE((SELECT balance FROM economy WHERE user_id = ?), 0) + ?)', [userId, userId, dailyCoins], (economyErr) => {
        if (economyErr) {
          console.error(economyErr);
          return interaction.reply('An error occurred while granting your daily coins.');
        }

        // Update the user's cooldown timestamp in the cooldowns database
        const currentTime = Date.now();
        dbCooldowns.run('INSERT OR REPLACE INTO cooldowns (user_id, timestamp) VALUES (?, ?)', [userId, currentTime]);

        interaction.reply(`You claimed your daily coins and received ${dailyCoins} coins!`);
      });
    });
  },
};
