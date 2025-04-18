<script lang="ts">
  import { getGuessMessage } from '$lib/data/guessMessages'

  export let currentRound: number
  export let players: string[]
  export let guesses: Record<string, number>

  $: dealerIndex = (currentRound - 1) % players.length
  $: firstPlayerIndex = dealerIndex === players.length - 1 ? 0 : dealerIndex + 1
  $: orderedPlayers = [
    ...players.slice(firstPlayerIndex),
    ...players.slice(0, firstPlayerIndex),
  ]

  // Find extreme guessers
  $: allGuesses = Object.values(guesses)
  $: highestGuess = Math.max(...allGuesses)
  $: lowestGuess = Math.min(...allGuesses)
  $: secondHighestGuess = [...allGuesses].sort((a, b) => b - a)[1] ?? 0
  $: secondLowestGuess = [...allGuesses].sort((a, b) => a - b)[1] ?? 0

  $: highestGuesser = Object.entries(guesses).find(
    ([_, g]) => g === highestGuess,
  )?.[0]
  $: lowestGuesser = Object.entries(guesses).find(
    ([_, g]) => g === lowestGuess,
  )?.[0]

  $: shouldShowHighMessage = highestGuess >= secondHighestGuess + 2
  $: shouldShowLowMessage = lowestGuess <= secondLowestGuess - 2

  function getMessage(player: string): string | null {
    if (player === highestGuesser && shouldShowHighMessage) {
      return getGuessMessage(true)
    }
    if (player === lowestGuesser && shouldShowLowMessage) {
      return getGuessMessage(false)
    }
    return null
  }
</script>

<h1>Play the round</h1>
<p>Play the tricks and keep track of who wins them</p>

<div class="wrapper">
  <div class="header">
    <div></div>
    <div class="column-header pico-color-violet-300">To Win</div>
  </div>

  <div class="players">
    {#each orderedPlayers as player}
      <div class="player-card">
        <div class="content">
          <div class="name pico-color-violet-500">
            <p>
              {player}
            </p>
            {#if getMessage(player)}
              <div class="message pico-color-violet-300">
                {getMessage(player)}
              </div>
            {/if}
          </div>
          <div class="guess-badge pico-background-violet-600">
            <span class="number">{guesses[player]}</span>
            <span class="label"
              >{guesses[player] === 1 ? 'trick' : 'tricks'}</span
            >
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .wrapper {
    margin-top: 2rem;
    display: grid;
    gap: 0.5rem;
  }

  .header {
    display: grid;
    grid-template-columns: 1fr auto;
    /* padding: 0 0.75rem; */
    margin-bottom: 0.25rem;
  }

  .column-header {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: 5rem;
    text-align: center;
    justify-self: center;
  }

  .players {
    display: grid;
    gap: 0;
    grid-template-columns: 1fr;
    border-top: 2px solid rgba(147, 51, 234, 0.2);
    overflow: hidden;
  }

  .player-card {
    padding: 0.5rem 0.25rem;
    border: none;
    border-bottom: 2px solid rgba(147, 51, 234, 0.2);
    background: transparent;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }

  .name p {
    margin-bottom: 0;
    word-break: break-word;
  }

  .message {
    font-size: 0.9rem;
    font-weight: normal;
    font-style: italic;
    margin-top: 0.25rem;
  }

  .guess-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-width: 5rem;
  }

  .guess-badge .number {
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 1;
  }

  .guess-badge .label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
