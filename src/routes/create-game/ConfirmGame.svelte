<script lang="ts">
  import { calculateRounds } from '$lib/utils/gameCalculations'
  import { getPlayerRoles } from '$lib/data/playerRoles'

  export let players: string[]

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

<style>
  .summary {
    margin-bottom: 2rem;
  }

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
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
