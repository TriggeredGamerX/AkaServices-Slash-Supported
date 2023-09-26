const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('google')
    .setDescription('Search Google.')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The query to search on Google.')
        .setRequired(true)),
  	category: 'Information',

  execute(interaction) {
    const query = interaction.options.getString('query');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    interaction.reply(`Here's your Google search result: ${searchUrl}`);
  },
};
