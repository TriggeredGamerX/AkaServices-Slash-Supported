const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database for economy
const dbEconomy = new sqlite3.Database('economy.db');

// Create the coinflip_stats table if it doesn't exist
dbEconomy.run(`
  CREATE TABLE IF NOT EXISTS coinflip_stats (
    user_id TEXT PRIMARY KEY,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error(err);
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Play a coinflip game to double your money or lose it.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('head')
        .setDescription('Bet on Heads')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('The amount of coins to bet.')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('tail')
        .setDescription('Bet on Tails')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('The amount of coins to bet.')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('View coinflip game statistics')),
  	category: 'Economy',

  async execute(interaction) {
    const userId = interaction.user.id;

    if (interaction.options.getSubcommand() === 'head' || interaction.options.getSubcommand() === 'tail') {
      playCoinflip(userId, interaction, interaction.options.getSubcommand());
    } else if (interaction.options.getSubcommand() === 'stats') {
      fetchCoinflipStats(userId, interaction);
    }
  },
};

function playCoinflip(userId, interaction, betChoice) {
  const amount = interaction.options.getInteger('amount');

  if (amount <= 0) {
    return interaction.reply('Please enter a valid bet amount greater than zero.');
  }

  // Check if the user has enough coins to bet
  dbEconomy.get('SELECT balance FROM economy WHERE user_id = ?', userId, (err, row) => {
    if (err) {
      console.error(err);
      return interaction.reply('An error occurred while checking your balance.');
    }

    if (!row || row.balance < amount) {
      return interaction.reply('You don\'t have enough coins to place that bet.');
    }

    // Simulate the coinflip with custom chances
    const winChance = 0.5; // 50% chance of winning (adjust as needed)
    const isWin = Math.random() < winChance;
    const result = isWin ? betChoice : (betChoice === 'head' ? 'tail' : 'head');

    if (isWin) {
      // User wins and doubles their money
      const winnings = amount * 2;

      // Update the user's balance in the database
      dbEconomy.run('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId], (economyErr) => {
        if (economyErr) {
          console.error(economyErr);
          return interaction.reply('An error occurred while processing your winnings.');
        }

        // Update the user's win count in the coinflip_stats table
        dbEconomy.run('INSERT OR REPLACE INTO coinflip_stats (user_id, wins, losses) VALUES (?, COALESCE((SELECT wins FROM coinflip_stats WHERE user_id = ?), 0) + 1, COALESCE((SELECT losses FROM coinflip_stats WHERE user_id = ?), 0))', [userId, userId, userId], (statsErr) => {
          if (statsErr) {
            console.error(statsErr);
          }

          interaction.reply(`Congratulations! It's ${result}! You won ${winnings} coins.`);
        });
      });
    } else {
      // User loses the bet
      const loss = amount;

      // Update the user's balance in the database
      dbEconomy.run('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [loss, userId], (economyErr) => {
        if (economyErr) {
          console.error(economyErr);
          return interaction.reply('An error occurred while processing your loss.');
        }

        // Update the user's loss count in the coinflip_stats table
        dbEconomy.run('INSERT OR REPLACE INTO coinflip_stats (user_id, wins, losses) VALUES (?, COALESCE((SELECT wins FROM coinflip_stats WHERE user_id = ?), 0), COALESCE((SELECT losses FROM coinflip_stats WHERE user_id = ?), 0) + 1)', [userId, userId, userId], (statsErr) => {
          if (statsErr) {
            console.error(statsErr);
          }

          interaction.reply(`Sorry, it's ${result}. You lost ${loss} coins.`);
        });
      });
    }
  });
}

function fetchCoinflipStats(userId, interaction) {
  // Fetch user's win and loss statistics from the coinflip_stats table
  dbEconomy.get('SELECT wins, losses FROM coinflip_stats WHERE user_id = ?', userId, (err, row) => {
    if (err) {
      console.error(err);
      return interaction.reply('An error occurred while fetching your statistics.');
    }

    const wins = row ? row.wins : 0;
    const losses = row ? row.losses : 0;
    const totalGames = wins + losses;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    // Create an array to store the field values for the embed
    const fields = [];

    fields.push({ name: 'Total Games', value: totalGames.toString(), inline: true });
    fields.push({ name: 'Total Wins', value: wins.toString(), inline: true });
    fields.push({ name: 'Total Losses', value: losses.toString(), inline: true });
    fields.push({ name: 'Win Rate', value: `${winRate.toFixed(2)}%`, inline: true });

    const statsEmbed = new MessageEmbed()
      .setColor('#3498db')
      .setTitle('Coinflip Game Statistics')
      .addFields(fields);

    interaction.reply({ embeds: [statsEmbed] });
  });
}
