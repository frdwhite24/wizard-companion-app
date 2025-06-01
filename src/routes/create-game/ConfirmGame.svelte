<script lang="ts">
  import { calculateRounds } from '$lib/utils/gameCalculations'
  import { getPlayerRoles } from '$lib/data/playerRoles'
  import type { GameConfig } from '$lib/utils/types/gameConfig'

  export let players: string[]
  export let config: GameConfig

  $: rounds = calculateRounds(players.length)
  $: playerRoles = getPlayerRoles(players.length)
</script>

<h1>Is this correct?</h1>
<div class="summary">
  <p>Playing with {players.length} players over {rounds} rounds</p>
</div>
<div class="player-list">
  {#each players as player, index}
    <div class="player-row">
      <p>
        {player}
      </p>
      <small>{playerRoles[index]} </small>
    </div>
  {/each}
</div>
<div class="config-summary">
  <p>Game configuration</p>
  <small>
    Guess restriction: {config.guessRestrictionEnabled
      ? 'Total guesses cannot equal cards in play'
      : 'No restriction on total guesses'}
  </small>
</div>

<style>
  .summary {
    margin-bottom: 2rem;
  }

  .config-summary {
    margin-top: 32px;
  }

  .config-summary p {
    margin: 0;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .player-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .player-row p {
    margin-bottom: 0;
  }

  small {
    color: var(--pico-secondary);
  }
</style>
