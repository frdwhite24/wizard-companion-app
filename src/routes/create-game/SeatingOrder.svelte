<script lang="ts">
  import { flip } from 'svelte/animate'

  export let players: string[]
  export let onMove: (index: number, direction: 'up' | 'down') => void
</script>

<h1>Where are they sitting?</h1>
<p>Arrange players clockwise to determine dealing order</p>

<div class="player-list">
  {#each players as player, index (player)}
    <div class="player-row" animate:flip={{ duration: 300 }}>
      <span>{player}</span>
      <div class="controls">
        <button
          class="outline"
          on:click={() => onMove(index, 'up')}
          disabled={index === 0}>↑</button
        >
        <button
          class="outline"
          on:click={() => onMove(index, 'down')}
          disabled={index === players.length - 1}>↓</button
        >
      </div>
    </div>
  {/each}
</div>

<style>
  p {
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
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }
</style>
