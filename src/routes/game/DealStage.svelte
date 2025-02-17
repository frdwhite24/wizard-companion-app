<script lang="ts">
  export let currentRound: number
  export let players: string[]

  $: dealerIndex = (currentRound - 1) % players.length
  $: dealer = players[dealerIndex]
</script>

<h1>Deal the cards</h1>
<p>
  <strong>{dealer}</strong> deals <strong>{currentRound}</strong>
  {currentRound === 1 ? 'card' : 'cards'} to each player
</p>

<div class="players">
  {#each players as player, index}
    <div class="player-row">
      <span>{player}</span>
      {#if index === dealerIndex}
        <small>Dealing</small>
      {/if}
    </div>
  {/each}
</div>

<style>
  .players {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }
</style>
