const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Search Wikipedia.')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The query to search on Wikipedia.')
        .setRequired(true)),
  	category: 'Information',

  execute(interaction) {
    const query = interaction.options.getString('query');
    const searchUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
    
    interaction.reply(`Here's your Wikipedia search result: ${searchUrl}`);
  },
};
