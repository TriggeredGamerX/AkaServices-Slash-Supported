const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency to the Discord server, API, and server.'),
  	category: 'Information',

  async execute(interaction) {
    const pingBot = Date.now() - interaction.createdTimestamp;
    const pingAPI = interaction.client.ws.ping;

    const serverLatencyStart = Date.now();
    const serverLatencyEnd = Date.now();
    const serverLatency = serverLatencyEnd - serverLatencyStart;

    let statusEmoji = '🟢'; // Green emoji for good latency

    if (pingBot > 200 || pingAPI > 200 || serverLatency > 200) {
      statusEmoji = '🔴'; // Red emoji for high latency
    } else if (pingBot > 100 || pingAPI > 100 || serverLatency > 100) {
      statusEmoji = '🟡'; // Yellow emoji for moderate latency
    }

    const embed = new MessageEmbed()
      .setColor('#3498db')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${pingBot}ms`, inline: true },
        { name: 'API Latency', value: `${pingAPI}ms`, inline: true },
        { name: 'Server Latency', value: `${serverLatency}ms`, inline: true }
      )
      .setDescription(`Ping results for the bot, Discord API, and server. ${statusEmoji}`)
      .setFooter('Requested by ' + interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
