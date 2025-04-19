<script lang="ts">
  export let currentRound: number
  export let players: string[]

  $: dealerIndex = (currentRound - 1) % players.length
  $: dealer = players[dealerIndex]
</script>

<h1>Deal the cards</h1>
<p>
  <strong>{dealer}</strong> deals <strong>{currentRound}</strong>
  {currentRound === 1 ? 'card' : 'cards'} to each player, and turns over the trump
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
<details>
  <summary class="summary-text">What does the trump mean?</summary>
  <p>
    If there are no cards left or a jester is turned there is no trump suit,
    only the wizards are trump.
  </p>
  <br />
  <p>If a wizard is turned the dealer picks a trump suit.</p>
</details>

<style>
  .players {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin: 2rem 0;
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

  details {
    border: 1px solid var(--pico-primary-border);
    padding: 16px;
    border-radius: var(--pico-border-radius);
  }

  details p {
    margin-bottom: 0;
  }

  details[open] > summary:not([role]):not(:focus),
  details summary {
    color: var(--pico-accordion-active-summary-color);
  }
</style>
