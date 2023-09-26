const { SlashCommandBuilder } = require('@discordjs/builders');

const compliments = [
  'You are amazing!',
  'You make the world a better place.',
  'You are loved and appreciated.',
  // Add more compliments here
];

function getRandomCompliment() {
  const randomIndex = Math.floor(Math.random() * compliments.length);
  return compliments[randomIndex];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Give a compliment to a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to compliment.')
        .setRequired(true)),
  	category: 'Fun',

  execute(interaction) {
    const user = interaction.options.getUser('user');
    const randomCompliment = getRandomCompliment();

    interaction.reply(`Hey ${user}, ${randomCompliment}`);
  },
};
