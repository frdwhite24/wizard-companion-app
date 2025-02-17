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
      <span class="name">{player}</span>
      <small class="role">{playerRoles[index]}</small>
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
    gap: 1rem;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--secondary);
    border-radius: var(--border-radius);
    gap: 1rem;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
  }

  .role {
    color: var(--secondary);
    flex-shrink: 0;
  }
</style>
