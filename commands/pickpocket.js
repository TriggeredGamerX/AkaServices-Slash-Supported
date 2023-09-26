const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');
// Connect to the SQLite database for cooldowns
const cooldownsDB = new sqlite3.Database('cooldowns.db');

cooldownsDB.run(`
  CREATE TABLE IF NOT EXISTS pickpocket_cooldowns (
    user_id TEXT PRIMARY KEY,
    cooldown_end INTEGER
  )
`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('pickpocket_cooldowns table created.');
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pickpocket')
    .setDescription('Attempt to pickpocket someone.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user you want to pickpocket.')
        .setRequired(true)),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('target');

    // Check if the user is on cooldown
    cooldownsDB.get('SELECT cooldown_end FROM pickpocket_cooldowns WHERE user_id = ?', userId, (err, cooldownRow) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking cooldown.');
      }

      const currentTime = Date.now();

      if (cooldownRow && cooldownRow.cooldown_end > currentTime) {
        // User is on cooldown
        const remainingTime = Math.ceil((cooldownRow.cooldown_end - currentTime) / 1000); // Convert to seconds
        return interaction.reply(`You are on cooldown. Try again in ${remainingTime} seconds.`);
      }

      // Check if the target user exists in the database
      db.get('SELECT balance FROM economy WHERE user_id = ?', target.id, (err, row) => {
        if (err) {
          console.error(err);
          return interaction.reply('An error occurred while checking the target user\'s balance.');
        }

        // Check if the target has enough money to pickpocket
        if (!row || row.balance <= 0) {
          return interaction.reply('The target doesn\'t have any coins to pickpocket.');
        }

        // Generate a random amount to pickpocket from the target's balance
        const maxPickpocketAmount = Math.min(row.balance, 100); // Adjust the maximum amount as needed
        const stolenAmount = Math.floor(Math.random() * maxPickpocketAmount) + 1;

        // Perform pickpocket logic
        const isSuccessful = Math.random() < 0.5; // 50% chance of success, adjust as needed

        if (isSuccessful) {
          // You successfully pickpocketed the target
          const remainingAmount = row.balance - stolenAmount;

          // Update the target's balance
          db.run('UPDATE economy SET balance = ? WHERE user_id = ?', [remainingAmount, target.id], (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              return interaction.reply('An error occurred while processing the pickpocket.');
            }

            // Update the user's balance
            db.run('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [stolenAmount, userId], (updateErr2) => {
              if (updateErr2) {
                console.error(updateErr2);
                return interaction.reply('An error occurred while processing the pickpocket.');
              }

              // Set cooldown for the user
              const cooldownTime = (stolenAmount > 50) ? 7200 : 3600; // 2 hours or 1 hour cooldown based on stolen amount
              const cooldownEnd = currentTime + cooldownTime * 1000; // Convert to milliseconds

              // Update or insert the cooldown record in the database
              cooldownsDB.run('INSERT OR REPLACE INTO pickpocket_cooldowns (user_id, cooldown_end) VALUES (?, ?)', [userId, cooldownEnd], (cooldownErr) => {
                if (cooldownErr) {
                  console.error(cooldownErr);
                  return interaction.reply('An error occurred while setting cooldown.');
                }

                // Send a success message with the stolen amount
                const successEmbed = new MessageEmbed()
                  .setColor('#3498db')
                  .setTitle('Pickpocket Success')
                  .setDescription(`You successfully pickpocketed ${stolenAmount} coins from ${target.tag}.`);
                return interaction.reply({ embeds: [successEmbed] });
              });
            });
          });
        } else {
          // You failed to pickpocket
          // Set cooldown for the user
          const cooldownTime = (stolenAmount > 50) ? 7200 : 3600; // 2 hours or 1 hour cooldown based on stolen amount
          const cooldownEnd = currentTime + cooldownTime * 1000; // Convert to milliseconds

          // Update or insert the cooldown record in the database
          cooldownsDB.run('INSERT OR REPLACE INTO pickpocket_cooldowns (user_id, cooldown_end) VALUES (?, ?)', [userId, cooldownEnd], (cooldownErr) => {
            if (cooldownErr) {
              console.error(cooldownErr);
              return interaction.reply('An error occurred while setting cooldown.');
            }

            // Send a failure message
            const failureEmbed = new MessageEmbed()
              .setColor('#e74c3c')
              .setTitle('Pickpocket Failed')
              .setDescription(`You failed to pickpocket ${target.tag}. You are on cooldown.`);
            return interaction.reply({ embeds: [failureEmbed] });
          });
        }
      });
    });
  },
};
