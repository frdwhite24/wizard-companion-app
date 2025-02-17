<script lang="ts">
  export let currentRound: number
  export let players: string[]
  export let guesses: Record<string, number>
  export let onGuessChange: (player: string, value: number) => void

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

  function getForbiddenMessage(player: string): string | null {
    if (player !== orderedPlayers[orderedPlayers.length - 1]) return null
    const forbiddenValue = currentRound - getTotalGuessesExcluding(player)
    return forbiddenValue < 0
      ? 'May guess whatever they like'
      : `May not guess ${forbiddenValue}`
  }

  function updateGuess(player: string, value: number) {
    if (value >= 0) {
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

<div class="players">
  {#each orderedPlayers as player}
    <div class="player-row">
      <div class="player-info">
        <span>{player}</span>
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
          >+</button
        >
      </div>
    </div>
  {/each}
</div>

<style>
  .players {
    display: flex;
    flex-direction: column;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    gap: 1rem;
    border: 1px solid var(--secondary);
    border-radius: var(--border-radius);
  }

  .player-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .player-info span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .guess-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .guess-value {
    min-width: 2.5rem;
    text-align: center;
    font-size: 1.2rem;
  }

  button {
    padding: 0.5rem 1rem;
    min-width: 3rem;
    font-size: 1.2rem;
  }

  .warning {
    color: var(--error);
    font-size: 0.8rem;
  }

  .info {
    color: var(--secondary);
    font-size: 0.8rem;
  }
</style>
