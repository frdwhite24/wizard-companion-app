const playerRoles = [
  // First player specific
  { text: 'First to deal', position: 0 },

  // Second player specific
  { text: 'First to guess', position: 1 },

  // General roles (can be any position)
  { text: 'Filling up the drinks' },
  { text: 'Too busy eating garlic bread' },
  { text: 'Plotting their strategy' },
  { text: 'Practicing their poker face' },
  { text: 'Counting cards (allegedly)' },
  { text: 'Making snack runs' },
  { text: 'Providing commentary' },
  { text: 'Taking suspiciously long bathroom breaks' },
  { text: 'Checking their phone under the table' },
  { text: 'Blaming the dealer for bad cards' },
  { text: 'Already planning their comeback' },
  { text: 'Perfecting their shuffle technique' },
  { text: "Asking 'What's trump again?'" },
  { text: 'Calculating the odds' },
  { text: 'Making excuses early' },
  { text: "Studying everyone's tells" },
  { text: 'Organizing the snack rotation' },
  { text: 'Keeping the score (suspiciously)' },
  { text: 'Shuffling their feet nervously' },
  { text: 'Playing mind games with themselves' },
  { text: 'Wondering why they agreed to this' },
  { text: 'Pretending to understand the rules' },
  { text: 'Already planning their victory speech' },
  { text: 'Questioning their life choices' },
  { text: "Memorizing everyone's favorite drinks" },
  { text: 'Practicing their victory dance' },
  { text: 'Taking way too long to predict' },
  { text: 'Regretting that last coffee' },
  { text: 'Eyeing the snack bowl' },
  { text: 'Contemplating their strategy' },
  { text: 'Making everyone wait' },
  { text: 'Checking the rule book again' },
  { text: 'Asking if zero is a valid guess' },
  { text: 'Asking which card is the wizard again' },
  { text: 'Asking if the wizards have a colour again' },
  { text: 'Strategically sitting near the snacks' },
  { text: 'Saying they hate the game' },
  { text: 'Trying to read upside down cards' },
  { text: 'Forgetting their own predictions' },
  { text: 'Mastering the art of the poker face' },
  { text: 'Calculating impossible odds' },
  { text: 'Rearranging their cards endlessly' },
  { text: 'Promising to play faster next round' },
  { text: 'Blaming their chair for bad luck' },
  { text: 'Considering a career in fortune telling' },
  { text: 'Perfecting their card-slapping technique' },
  { text: 'Wondering if psychic abilities are cheating' },
  { text: 'Planning to write a strategy guide' },
  { text: 'Practicing their winning smile' },
  { text: 'Developing a new shuffling theory' },
  { text: 'Taking notes for next time' },
  { text: 'Trying to remember how many cards are left' },
  { text: 'Questioning their life choices again' },
  { text: 'Hoping no one notices their tells' },
  { text: 'Wishing they brought snacks' },
  { text: 'Already planning the next game night' },
]

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArray[i]
    if (temp !== undefined && newArray[j] !== undefined) {
      newArray[i] = newArray[j]
      newArray[j] = temp
    }
  }
  return newArray
}

export function getPlayerRoles(playerCount: number): string[] {
  const firstPlayerRoles = playerRoles.filter((role) => role.position === 0)
  const firstPlayerRole =
    firstPlayerRoles[Math.floor(Math.random() * firstPlayerRoles.length)]
      ?.text ?? 'Shuffling the pack'

  const secondPlayerRoles = playerRoles.filter((role) => role.position === 1)
  const secondPlayerRole =
    secondPlayerRoles[Math.floor(Math.random() * secondPlayerRoles.length)]
      ?.text ?? 'Making the first guess'

  const generalRoles = shuffleArray(
    playerRoles
      .filter((role) => role.position === undefined)
      .map((role) => role.text),
  ).slice(0, playerCount - 2)

  return [firstPlayerRole, secondPlayerRole, ...generalRoles]
}
