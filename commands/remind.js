const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const reminders = new Map(); // Store reminders in a Map

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder for a specific time or duration.')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('The time for the reminder (e.g., 1h30m or 10s).')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The reminder message.')
        .setRequired(true)
    ),
  	category: 'Utility',

  async execute(interaction) {
    const user = interaction.user;
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');

    // Parse the time input (e.g., 1h30m, 10s)
    const regex = /(\d+)([smh])/g;
    const matches = [...time.matchAll(regex)];

    let duration = 0;
    for (const match of matches) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit === 's') duration += value * 1000; // seconds
      if (unit === 'm') duration += value * 60 * 1000; // minutes
      if (unit === 'h') duration += value * 60 * 60 * 1000; // hours
    }

    const reminderTime = Date.now() + duration;

    // Store the reminder in the Map
    reminders.set(user.id, { message, time: reminderTime });

    // Send a confirmation message
    const embed = new MessageEmbed()
      .setColor('#3498db')
      .setTitle('✅ Reminder Set')
      .setDescription(`I will remind you: "${message}" in ${time}`)
      .setFooter('Requested by ' + user.tag, user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Schedule a reminder to be sent
    setTimeout(() => {
      const storedReminder = reminders.get(user.id);
      if (storedReminder) {
        const reminderEmbed = new MessageEmbed()
          .setColor('#e74c3c')
          .setTitle('⏰ Reminder')
          .setDescription(`Reminder: "${storedReminder.message}"`)
          .setFooter('Requested by ' + user.tag, user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        interaction.user.send({ embeds: [reminderEmbed] });
        reminders.delete(user.id);
      }
    }, duration);
  },
};
