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
      <p>{player}</p>
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
    gap: 24px;
    margin-top: 2rem;
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
