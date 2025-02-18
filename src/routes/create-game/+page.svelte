<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount, onDestroy, afterUpdate } from 'svelte'
  import { browser } from '$app/environment'
  import AddPlayers from './AddPlayers.svelte'
  import SeatingOrder from './SeatingOrder.svelte'
  import {
    getCreateGameState,
    setCreateGameState,
    clearCreateGameState,
    type CreateGameState,
  } from '$lib/storage/createGame'
  import ConfirmGame from './ConfirmGame.svelte'
  import { calculateRounds } from '$lib/utils/gameCalculations'
  import { setGameState } from '$lib/storage/gameState'
  import confetti from 'canvas-confetti'

  let gameState: CreateGameState = {
    step: 1,
    players: [],
    lastUpdated: Date.now(),
  }

  let mainElement: HTMLElement

  function validateStep(state: CreateGameState): number {
    // If we don't have enough players, we must be on step 1
    if (state.players.length < 3) {
      return 1
    }
    // Otherwise, allow current step if valid
    return state.step >= 1 && state.step <= 3 ? state.step : 1
  }

  // Listen for browser navigation
  function handlePopState() {
    if (browser) {
      const urlStep = parseInt($page.url.searchParams.get('step') ?? '1')
      const stored = getCreateGameState()
      if (stored) {
        gameState = {
          ...stored,
          step: validateStep({ ...stored, step: urlStep }),
        }
        setCreateGameState(gameState)
      }
    }
  }

  onMount(() => {
    const stored = getCreateGameState()
    if (stored) {
      const validStep = validateStep(stored)
      gameState = {
        ...stored,
        step: validStep,
      }

      // Only update URL if it doesn't match state
      const urlStep = parseInt($page.url.searchParams.get('step') ?? '1')
      if (validStep !== urlStep) {
        goto(`?step=${validStep}`, { keepFocus: true, replaceState: true })
      }
    }

    // Add popstate listener
    window.addEventListener('popstate', handlePopState)
  })

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('popstate', handlePopState)
    }
  })

  // Watch for step changes and reset scroll
  afterUpdate(() => {
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  })

  function addPlayer(name: string) {
    if (gameState.players.length < 6) {
      gameState.players = [...gameState.players, name]
      setCreateGameState(gameState)
    }
  }

  function removePlayer(index: number) {
    gameState.players = gameState.players.filter((_, i) => i !== index)
    setCreateGameState(gameState)
  }

  function movePlayer(index: number, direction: 'up' | 'down') {
    if (!gameState) return

    const newPlayers = [...gameState.players]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    // Swap players
    const temp = newPlayers[index]
    newPlayers[index] = newPlayers[targetIndex]
    newPlayers[targetIndex] = temp

    // Update state
    gameState = {
      ...gameState,
      players: newPlayers,
      lastUpdated: Date.now(),
    }
    setCreateGameState(gameState)
  }

  function nextStep() {
    if (gameState.players.length >= 3 && gameState.players.length <= 6) {
      gameState.step = gameState.step === 1 ? 2 : 3
      setCreateGameState(gameState)
      goto(`?step=${gameState.step}`, { keepFocus: true })
    }
  }

  function startGame() {
    const totalRounds = calculateRounds(gameState.players.length)
    setGameState({
      players: gameState.players,
      totalRounds,
      currentRound: 1,
      stage: 'deal',
      rounds: [],
      lastUpdated: Date.now(),
    })
    clearCreateGameState()
    goto('/game')
    confetti()
  }

  $: canProceed = gameState.players.length >= 3 && gameState.players.length <= 6
</script>

<div class="page">
  <header class="container">
    <progress value={(gameState.step / 3) * 100} max="100"></progress>
    <small>Step {gameState.step} of 3</small>
  </header>

  <main class="container" bind:this={mainElement}>
    {#if gameState.step === 1}
      <AddPlayers
        players={gameState.players}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
      />
    {:else if gameState.step === 2}
      <SeatingOrder players={gameState.players} onMove={movePlayer} />
    {:else}
      <ConfirmGame players={gameState.players} />
    {/if}
  </main>

  <footer class="container">
    <div class="buttons">
      <button class="outline" on:click={() => history.back()}>Back</button>
      <button
        disabled={!canProceed}
        on:click={gameState.step === 3 ? startGame : nextStep}
        class={gameState.step === 3 ? 'primary' : ''}
      >
        {gameState.step === 3 ? 'Start game!' : 'Continue'}
      </button>
    </div>
  </footer>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  footer {
    flex-shrink: 0;
    padding-top: 1rem;
  }

  main {
    flex: 1;
    overflow-y: auto;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  button {
    width: 100%;
  }
</style>
