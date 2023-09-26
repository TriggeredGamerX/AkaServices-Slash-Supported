const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database
const db = new sqlite3.Database('cooldowns.db');

// Create a custom table for ad cooldowns if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS custom_adcooldown (
    user_id TEXT PRIMARY KEY,
    can_advertise INTEGER
  )
`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ad')
    .setDescription('Advertise a Discord server by posting an invite link.')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The invite link to the Discord server.')
        .setRequired(true)),
  	category: 'Utility',

  async execute(interaction) {
    const userId = interaction.user.id;

    // Check if the user is allowed to advertise using the custom database
    db.get('SELECT * FROM custom_adcooldown WHERE user_id = ?', userId, (err, row) => {
      if (err) {
        console.error(err);
        return;
      }

      // Check if the user is allowed to advertise
      if (row && row.can_advertise === 0) {
        return interaction.reply("You're on cooldown. You can use this command again in 24 hours.");
      }

      const link = interaction.options.getString('link');
      const adChannelId = config.adChannelId; // Use the channel ID from the config file

      // Find the Advertise channel by ID
      const adChannel = interaction.guild.channels.cache.get(adChannelId);

      if (!adChannel || adChannel.type !== 'GUILD_TEXT') {
        return interaction.reply('The Advertise channel is not set up correctly. Please contact a server administrator.');
      }

      // Send the invite link to the Advertise channel
      const inviteEmbed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle('Server Advertisement')
        .setDescription(`Check out this server:\n${link}`)
.setFooter({ text: `Posted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 64 }) })
        .setTimestamp();

      adChannel.send({ embeds: [inviteEmbed] });

      // Update the user's cooldown status in the custom database
      db.run('INSERT OR REPLACE INTO custom_adcooldown (user_id, can_advertise) VALUES (?, ?)', [userId, 0]);

      // Reply to the user indicating the success of their advertisement
      interaction.reply('Your server advertisement has been posted in the Advertise channel.');
    });
  },
};
