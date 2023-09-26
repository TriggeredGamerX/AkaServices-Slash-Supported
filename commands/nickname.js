const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change the nickname of a user in the server.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose nickname you want to change.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('The new nickname for the user.')
        .setRequired(true)
    ),
  	category: 'Server',

  async execute(interaction) {
    const user = interaction.options.getMember('user'); // Ensure user is a GuildMember
    const nickname = interaction.options.getString('nickname');

    // Check if the bot has permission to manage nicknames
    if (!interaction.guild.me.permissions.has('MANAGE_NICKNAMES')) {
      const errorEmbed = new MessageEmbed()
        .setColor('#ff0000') // Red
        .setTitle('Permission Denied')
        .setDescription('I do not have permission to change nicknames.')
        .setFooter(`Action by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed] });
    }

    try {
      await user.setNickname(nickname);

      const successEmbed = new MessageEmbed()
        .setColor('#00ff00') // Green
        .setTitle('Nickname Changed')
        .setDescription(`Nickname of ${user.user.tag} has been changed to ${nickname}`)
        .setFooter(`Action by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);

      const errorEmbed = new MessageEmbed()
        .setColor('#ff0000') // Red
        .setTitle('Error')
        .setDescription('An error occurred while changing the nickname.')
        .setFooter(`Action by ${interaction.user.tag}`, interaction.user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
