<script lang="ts">
  import type { GameConfig } from '$lib/types/gameConfig'

  export let currentRound: number
  export let players: string[]
  export let guesses: Record<string, number>
  export let onGuessChange: (player: string, value: number) => void
  export let config: GameConfig

  $: dealerIndex = (currentRound - 1) % players.length
  $: firstGuesserIndex =
    dealerIndex === players.length - 1 ? 0 : dealerIndex + 1

  // Reorder players to start with first guesser
  $: orderedPlayers = [
    ...players.slice(firstGuesserIndex),
    ...players.slice(0, firstGuesserIndex),
  ]

  // Calculate total guesses excluding current player
  function getTotalGuessesExcluding(player: string): number {
    return Object.entries(guesses)
      .filter(([p]) => p !== player)
      .reduce((sum, [_, guess]) => sum + guess, 0)
  }

  // Calculate total guesses
  $: totalGuesses = Object.values(guesses).reduce((sum, g) => sum + g, 0)
  $: isExact = totalGuesses === currentRound

  function getForbiddenMessage(player: string): string | null {
    if (
      player !== orderedPlayers[orderedPlayers.length - 1] ||
      !config.guessRestrictionEnabled
    )
      return null
    const forbiddenValue = currentRound - getTotalGuessesExcluding(player)
    return forbiddenValue < 0
      ? 'May guess whatever they like'
      : `May not guess ${forbiddenValue}`
  }

  function updateGuess(player: string, value: number) {
    if (value >= 0 && value <= currentRound) {
      onGuessChange(player, value)
    }
  }

  function getPlayerMessage(player: string): string | null {
    if (player === orderedPlayers[0]) {
      return 'Guesses first'
    }
    return getForbiddenMessage(player)
  }

  function getMessageClass(player: string): string {
    return player === orderedPlayers[0] ? 'info' : 'warning'
  }
</script>

<h1>Make your guesses</h1>
<p>Each player guesses how many tricks they'll win</p>

<div class="status">
  <div class="validation {isExact ? 'exact' : 'pending'}">
    {totalGuesses} of {currentRound} trick{currentRound === 1 ? '' : 's'} claimed
  </div>
</div>

<div class="players">
  {#each orderedPlayers as player}
    <div class="player-row">
      <div class="player-info">
        <p>{player}</p>
        {#if getPlayerMessage(player) !== null}
          <small class={getMessageClass(player)}
            >{getPlayerMessage(player)}</small
          >
        {/if}
      </div>
      <div class="guess-controls">
        <button
          class="outline"
          on:click={() => updateGuess(player, (guesses[player] ?? 0) - 1)}
          disabled={guesses[player] === 0}>−</button
        >
        <span class="guess-value">{guesses[player] ?? 0}</span>
        <button
          class="outline"
          on:click={() => updateGuess(player, (guesses[player] ?? 0) + 1)}
          disabled={(guesses[player] ?? 0) >= currentRound}>+</button
        >
      </div>
    </div>
  {/each}
</div>

<style>
  .players {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 32px;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .player-info p {
    margin-bottom: 0;
  }

  .guess-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .guess-value {
    min-width: 2rem;
    text-align: center;
    font-size: 1.2rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
  }

  .warning {
    font-size: 0.8rem;
  }

  .info {
    font-size: 0.8rem;
  }

  .status {
    height: 3rem;
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }

  .validation {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
    text-align: center;
  }

  .validation.pending {
    background: rgba(147, 51, 234, 0.1);
    color: rgb(147, 51, 234);
  }

  .validation.exact {
    background: rgba(52, 211, 153, 0.1);
    color: rgb(52, 211, 153);
  }
</style>
