<script lang="ts">
  import { getGameState } from '$lib/storage/gameState'
  import { getCreateGameState } from '$lib/storage/createGame'
  import { goto } from '$app/navigation'
  import logo from '$lib/assets/logo.png'

  $: gameInProgress = getGameState() !== null
  $: setupInProgress = getCreateGameState() !== null

  function startNewGame() {
    goto('/create-game')
  }

  function continueGame() {
    goto('/game')
  }

  function continueSetup() {
    goto('/create-game')
  }
</script>

<div class="page">
  <main class="container">
    <img alt="The wizard card game logo" src={logo} />
    <h1>Wizard Card Game</h1>
    <p>A helper app for playing Wizard</p>
  </main>

  <footer class="container">
    <button on:click={startNewGame} class="primary">Start new game</button>
    {#if gameInProgress}
      <button class="outline" on:click={continueGame}
        >Continue previous game</button
      >
    {/if}
    {#if setupInProgress}
      <button class="outline" on:click={continueSetup}
        >Continue previous setup</button
      >
    {/if}
  </footer>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  main {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1rem;
    text-align: center;
  }

  img {
    padding: 1rem 0;
  }

  footer {
    flex-shrink: 0;
    padding: 1rem;
    background: var(--background-color);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    width: 100%;
  }
</style>
