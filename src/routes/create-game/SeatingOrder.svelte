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
      <p>{player}</p>
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
    gap: 8px;
  }

  .player-row {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 1rem;
    align-items: center;
  }

  .player-row p {
    margin: 0;
    word-break: break-word;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }
</style>
