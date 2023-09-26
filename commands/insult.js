const { SlashCommandBuilder } = require('@discordjs/builders');

// Function to generate a random insult
function generateRandomInsult() {
  // Define insult components
  const adjectives = ['stupid', 'smelly', 'clueless', 'ugly', 'pathetic'];
  const nouns = ['donkey', 'pigeon', 'potato', 'sock', 'cabbage'];

  // Randomly select an adjective and noun
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  // Combine them to form an insult
  return `You ${randomAdjective} ${randomNoun}!`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insult')
    .setDescription('Insult a user (for fun)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to insult')
        .setRequired(true)),
    	category: 'Fun',

  
  async execute(interaction) {
    const userToInsult = interaction.options.getUser('user');
    
    // Generate a random insult
    const randomInsult = generateRandomInsult();

    // Send the insult to the user
    await interaction.reply(`Hey ${userToInsult}, ${randomInsult}`);
  },
};
