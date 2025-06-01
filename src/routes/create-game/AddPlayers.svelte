<script lang="ts">
  export let players: string[]
  export let onAddPlayer: (name: string) => void
  export let onRemovePlayer: (index: number) => void

  let newPlayerName = ''

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const enteredPlayerName = newPlayerName.trim()
    if (enteredPlayerName && !players.includes(enteredPlayerName)) {
      onAddPlayer(enteredPlayerName)
      newPlayerName = ''
      const input = document.getElementById('playerName')
      if (input instanceof HTMLInputElement) {
        input.focus()
      }
    }
  }
</script>

<h1>Who are you playing with?</h1>
<p>Choose between 3-6 players</p>

{#if players.length > 0}
  <div class="players">
    {#each players as player, index (player)}
      <button class="outline" on:click={() => onRemovePlayer(index)}>
        {player} ✕
      </button>
    {/each}
  </div>
{/if}

<form on:submit={handleSubmit}>
  <label for="playerName">
    Player name
    <input
      type="text"
      id="playerName"
      name="playerName"
      bind:value={newPlayerName}
      placeholder="Enter player name"
      disabled={players.length >= 6}
    />
  </label>
  <button type="submit" disabled={players.length >= 6}>Add player</button>
</form>

<style>
  .players {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
</style>
