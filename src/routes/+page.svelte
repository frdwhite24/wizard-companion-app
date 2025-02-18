<script lang="ts">
  import { getGameState } from '$lib/storage/gameState'
  import { getCreateGameState } from '$lib/storage/createGame'
  import { loadGameHistory } from '$lib/gameHistory'
  import { goto } from '$app/navigation'
  import logo from '$lib/assets/logo.png'
  import { clearCreateGameState } from '$lib/storage/createGame'
  import { onMount } from 'svelte'
  import { preloadData } from '$app/navigation'

  $: gameInProgress = getGameState() !== null
  $: setupInProgress = getCreateGameState() !== null
  $: gameHistory = loadGameHistory()
  $: hasHistory = gameHistory.length > 0

  function startNewGame() {
    clearCreateGameState()
    goto('/create-game')
  }

  function continueGame() {
    const gameState = getGameState()
    if (gameState) {
      goto(`/game?round=${gameState.currentRound}&stage=${gameState.stage}`)
    } else {
      goto('/game')
    }
  }

  function continueSetup() {
    goto('/create-game')
  }

  onMount(() => {
    // Prefetch all main routes
    const routes = ['/game', '/create-game', '/history']
    routes.forEach((route) => {
      preloadData(route)
    })
  })
</script>

<div class="page">
  <main class="container">
    <img alt="The wizard card game logo" src={logo} />
    <h1>Wizard Card Game</h1>
    <p>A companion app for playing Wizard</p>
    <a
      href="https://mobilesyrup.com/2020/05/24/how-install-progressive-web-app-pwa-android-ios-pc-mac/"
      class="install-button"
      target="_blank"
      rel="noopener noreferrer">How To: Install the App</a
    >
    <small>Made with ❤️ by Fred</small>
  </main>

  <footer class="container">
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
    {#if hasHistory}
      <a href="/history" role="button" class="outline">Game History</a>
    {/if}
    <button on:click={startNewGame} class="primary">Start new game</button>
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
    text-align: center;
  }

  img {
    padding-bottom: 1rem;
  }

  footer {
    flex-shrink: 0;
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    width: 100%;
  }

  .install-button {
    display: block;
    margin-bottom: 1rem;
  }
</style>
