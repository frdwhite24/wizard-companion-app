<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount, onDestroy, afterUpdate } from 'svelte'
  import { browser } from '$app/environment'
  import AddPlayers from './AddPlayers.svelte'
  import SeatingOrder from './SeatingOrder.svelte'
  import GameConfig from './GameConfig.svelte'
  import {
    getCreateGameState,
    setCreateGameState,
    clearCreateGameState,
    type CreateGameState,
  } from '$lib/storage/createGame'
  import ConfirmGame from './ConfirmGame.svelte'
  import { calculateRounds } from '$lib/utils/gameCalculations'
  import { setGameState } from '$lib/storage/gameState'
  import { DEFAULT_GAME_CONFIG } from '$lib/utils/types/gameConfig'
  import confetti from 'canvas-confetti'

  let gameState: CreateGameState = {
    step: 1,
    players: [],
    lastUpdated: Date.now(),
    config: DEFAULT_GAME_CONFIG,
  }

  let mainElement: HTMLElement

  function validateStep(state: CreateGameState): number {
    // If we don't have enough players, we must be on step 1
    if (state.players.length < 3) {
      return 1
    }
    // Otherwise, allow current step if valid
    return state.step >= 1 && state.step <= 4 ? state.step : 1
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
    const target = newPlayers[targetIndex]
    if (target && temp) {
      newPlayers[index] = target
      newPlayers[targetIndex] = temp
    }

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
      gameState.step = Math.min(gameState.step + 1, 4)
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
      stage: 'guess',
      rounds: [],
      lastUpdated: Date.now(),
      config: gameState.config,
    })
    clearCreateGameState()
    goto('/game')
    confetti()
  }

  $: canProceed = gameState.players.length >= 3 && gameState.players.length <= 6
  $: progress = (gameState.step / 4) * 100
</script>

<div class="page">
  <header class="container">
    <progress value={progress} max="100"></progress>
    <small>Step {gameState.step} of 4</small>
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
    {:else if gameState.step === 3}
      <GameConfig
        config={gameState.config}
        onChange={(config) => {
          gameState.config = config
          setCreateGameState(gameState)
        }}
      />
    {:else if gameState.step === 4}
      <ConfirmGame players={gameState.players} config={gameState.config} />
    {/if}
  </main>

  <footer class="container">
    <div class="buttons">
      <button class="outline" on:click={() => history.back()}>Back</button>
      <button
        disabled={!canProceed}
        on:click={gameState.step === 4 ? startGame : nextStep}
        class={gameState.step === 4 ? 'primary' : ''}
      >
        {gameState.step === 4 ? 'Start game!' : 'Continue'}
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
