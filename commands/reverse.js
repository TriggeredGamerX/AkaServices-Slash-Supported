const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverse a text message.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text you want to reverse.')
        .setRequired(true)),
  	category: 'Fun',

  execute(interaction) {
    const text = interaction.options.getString('text');

    // Reverse the text
    const reversedText = text.split('').reverse().join('');

    interaction.reply(`Reversed text: ${reversedText}`);
  },
};
