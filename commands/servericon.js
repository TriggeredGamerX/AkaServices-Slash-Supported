const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Displays the server\'s icon or banner.'),
  	category: 'Server',

  async execute(interaction) {
    const server = interaction.guild;

    const serverIconEmbed = new MessageEmbed()
      .setColor('#00ff00') // Green
      .setTitle(`Server Icon for ${server.name}`)
      .setImage(server.iconURL({ dynamic: true, size: 4096 }) || 'No Server Icon')
      .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
      .setTimestamp();

    interaction.reply({ embeds: [serverIconEmbed] });
  },
};
