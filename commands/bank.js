const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const db = new sqlite3.Database('economy.db');

// Add this code to update your database schema
db.run(`
  PRAGMA foreign_keys=off;
  BEGIN TRANSACTION;
  ALTER TABLE economy RENAME TO temp_table;
  CREATE TABLE economy (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 0
  );
  INSERT INTO economy SELECT user_id, balance FROM temp_table;
  DROP TABLE temp_table;
  COMMIT;
  PRAGMA foreign_keys=on;
`, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Bank column added to the economy table.');
  }
});


module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Check your bank balance.'),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;

    // Check the user's bank balance
    db.get('SELECT bank FROM economy WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return interaction.reply('An error occurred while checking your bank balance.');
      }

      const bankBalance = row ? row.bank : 0;

      const bankEmbed = new MessageEmbed()
        .setColor('#3498db')
        .setTitle('Bank Balance')
        .setDescription(`Your bank balance is: ${bankBalance} coins`);

      interaction.reply({ embeds: [bankEmbed] });
    });
  },
};
