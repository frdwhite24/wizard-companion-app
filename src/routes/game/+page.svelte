<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'
  import type { GameState } from '$lib/storage/gameState'
  import {
    clearGameState,
    getGameState,
    setGameState,
  } from '$lib/storage/gameState'
  import DealStage from './DealStage.svelte'
  import GuessStage from './GuessStage.svelte'
  import PlayStage from './PlayStage.svelte'
  import ResultsStage from './ResultsStage.svelte'
  import ScoreboardStage from './ScoreboardStage.svelte'
  import { page } from '$app/stores'
  import { saveGameToHistory } from '$lib/gameHistory'
  import Modal from '$lib/components/Modal.svelte'
  import confetti from 'canvas-confetti'

  let gameState: GameState | null = null

  // Modal state
  type ModalType = 'stopGame' | 'finishEarly' | null
  let activeModal: ModalType = null

  function initializeRound() {
    if (!gameState) return

    if (!gameState.rounds[gameState.currentRound - 1]) {
      gameState.rounds[gameState.currentRound - 1] = {
        guesses: Object.fromEntries(gameState.players.map((p) => [p, 0])),
        tricks: Object.fromEntries(gameState.players.map((p) => [p, 0])),
        scores: {},
      }
      setGameState(gameState)
    }
  }

  function updateURL(round: number, stage: GameState['stage']) {
    goto(`?round=${round}&stage=${stage}`, {
      keepFocus: true,
      replaceState: false,
    })
  }

  function handlePopState() {
    if (!gameState) return

    const urlRound = parseInt($page.url.searchParams.get('round') ?? '1')
    const urlStage =
      ($page.url.searchParams.get('stage') as GameState['stage']) ?? 'deal'

    // Going back from first stage of first round -> go home
    if (
      urlRound === 1 &&
      urlStage === 'deal' &&
      (gameState.currentRound > 1 || gameState.stage !== 'deal')
    ) {
      goto('/')
      return
    }

    // Calculate previous stage/round
    let newRound = gameState.currentRound
    let newStage = gameState.stage

    if (urlStage !== gameState.stage) {
      // Moving backwards within the same round
      const stages: GameState['stage'][] = ['deal', 'guess', 'play', 'result']
      const currentIndex = stages.indexOf(gameState.stage)
      const targetIndex = stages.indexOf(urlStage)

      if (targetIndex < currentIndex) {
        newStage = urlStage
      }
    }

    if (urlRound !== gameState.currentRound) {
      // Moving to previous round
      if (urlRound < gameState.currentRound) {
        newRound = urlRound
        newStage = 'result' // Go to results of previous round
      }
    }

    gameState = {
      ...gameState,
      currentRound: newRound,
      stage: newStage,
    }
    setGameState(gameState)
  }

  onMount(() => {
    gameState = getGameState()
    if (!gameState) {
      goto('/create-game')
      return
    }

    // Validate loaded state has all required properties
    if (
      !gameState.players?.length ||
      !gameState.totalRounds ||
      !gameState.stage ||
      !gameState.rounds
    ) {
      console.error('Invalid game state loaded')
      goto('/create-game')
      return
    }

    // Initialize round data if needed
    initializeRound()

    // Add popstate listener
    window.addEventListener('popstate', handlePopState)
  })

  onDestroy(() => {
    window.removeEventListener('popstate', handlePopState)
  })

  function getButtonText(
    stage: GameState['stage'],
    totalRounds: number,
    currentRound: number,
  ): string {
    const isFinalRound = totalRounds === currentRound
    const isSecondToLastRound = totalRounds - 1 === currentRound
    switch (stage) {
      case 'deal':
        return 'Start guessing'
      case 'guess':
        return 'Start playing'
      case 'play':
        return 'Enter results'
      case 'result':
        return isFinalRound ? 'See final scores!' : 'See scoreboard'
      case 'scoreboard':
        return isFinalRound
          ? 'Rematch'
          : isSecondToLastRound
            ? 'Play final round'
            : 'Play next round'
    }
  }

  function canProceed(): boolean {
    if (!gameState) return false

    switch (gameState.stage) {
      case 'deal':
        return true
      case 'guess': {
        const currentRound = gameState.rounds[gameState.currentRound - 1]
        if (!currentRound) return false

        // All players must have guessed
        const allGuessed = gameState.players.every(
          (p) => typeof currentRound.guesses[p] === 'number',
        )

        // Total guesses must not equal number of cards (only if restriction is enabled)
        const totalGuesses = Object.values(currentRound.guesses).reduce(
          (sum, g) => sum + g,
          0,
        )

        const restrictGuesses = gameState.config.guessRestrictionEnabled
        return (
          allGuessed &&
          (!restrictGuesses || totalGuesses !== gameState.currentRound)
        )
      }
      case 'play':
        return true
      case 'result': {
        const currentRound = gameState.rounds[gameState.currentRound - 1]
        if (!currentRound) {
          return false
        }

        // All players must have tricks recorded
        const allRecorded = gameState.players.every(
          (p) => typeof currentRound.tricks[p] === 'number',
        )

        // Total tricks must equal number of cards
        const totalTricks = Object.values(currentRound.tricks).reduce(
          (sum, t) => sum + t,
          0,
        )

        return allRecorded && totalTricks === gameState.currentRound
      }
      case 'scoreboard':
        return true
    }
  }

  function proceed(): void {
    if (!gameState) return

    switch (gameState.stage) {
      case 'deal':
        initializeRound()
        gameState.stage = 'guess'
        updateURL(gameState.currentRound, 'guess')
        break
      case 'guess':
        gameState.stage = 'play'
        updateURL(gameState.currentRound, 'play')
        break
      case 'play':
        gameState.stage = 'result'
        updateURL(gameState.currentRound, 'result')
        break
      case 'result':
        if (gameState.currentRound === gameState.totalRounds) {
          const completedGame = { ...gameState, completed: true }
          setGameState(completedGame)
          saveGameToHistory(completedGame)
          gameState.stage = 'scoreboard'
          updateURL(gameState.currentRound, 'scoreboard')
          confetti()
        } else {
          gameState.stage = 'scoreboard'
          updateURL(gameState.currentRound, 'scoreboard')
        }
        break
      case 'scoreboard':
        if (gameState.currentRound === gameState.totalRounds) {
          handleRematch()
        } else {
          gameState.currentRound += 1
          gameState.stage = 'deal'
          updateURL(gameState.currentRound, 'deal')
        }
        break
    }

    gameState = { ...gameState }
    setGameState(gameState)
  }

  function handleGuessChange(player: string, value: number) {
    if (!gameState) return

    const currentRound = gameState.rounds[gameState.currentRound - 1]
    if (!currentRound) return

    if (value >= 0) {
      currentRound.guesses = {
        ...currentRound.guesses,
        [player]: value,
      }
      gameState = { ...gameState }
      setGameState(gameState)
    }
  }

  // Create reactive references to current round data
  let currentRound: GameState['rounds'][0] | undefined
  let currentGuesses: Record<string, number>
  let currentTricks: Record<string, number>

  $: currentRound = gameState?.rounds[gameState.currentRound - 1]
  $: currentGuesses = currentRound?.guesses ?? {}
  $: currentTricks = currentRound?.tricks ?? {}

  function getStageName(stage: GameState['stage']): string {
    switch (stage) {
      case 'deal':
        return 'Dealing'
      case 'guess':
        return 'Guessing'
      case 'play':
        return 'Playing'
      case 'result':
        return 'Round Results'
      case 'scoreboard':
        return 'Game Summary'
    }
  }

  $: gameProgress = gameState
    ? (gameState.currentRound / gameState.totalRounds) * 100
    : 0

  $: stageProgress = gameState
    ? ({ deal: 1, guess: 2, play: 3, result: 4, scoreboard: 5 }[
        gameState.stage
      ] /
        5) *
      100
    : 0

  // Add tricks state handling
  function handleTrickChange(player: string, value: number) {
    if (!gameState) return

    const currentRound = gameState.rounds[gameState.currentRound - 1]
    if (!currentRound) return

    if (value >= 0) {
      currentRound.tricks = {
        ...currentRound.tricks,
        [player]: value,
      }
      gameState = { ...gameState }
      setGameState(gameState)
    }
  }

  function handleStopGame() {
    clearGameState()
    goto('/')
  }

  function handleFinishEarly() {
    if (gameState) {
      const completedGame = { ...gameState, completed: true }
      saveGameToHistory(completedGame)
      clearGameState()
      goto('/')
    }
  }

  function handleRematch() {
    if (gameState) {
      // Save current game in history
      const completedGame = { ...gameState, completed: true }
      saveGameToHistory(completedGame)

      // Create new game with same config
      const newGame: GameState = {
        players: gameState.players,
        currentRound: 1,
        totalRounds: gameState.totalRounds,
        stage: 'deal',
        rounds: [],
        lastUpdated: Date.now(),
        config: gameState.config, // Keep the same config for rematch
      }

      // Update both state and URL synchronously
      setGameState(newGame)
      goto('/game?round=1&stage=deal', { replaceState: true })
    }
  }

  function handleBack() {
    if (!gameState) return

    const stages: GameState['stage'][] = [
      'deal',
      'guess',
      'play',
      'result',
      'scoreboard',
    ]
    const currentStageIndex = stages.indexOf(gameState.stage)

    if (currentStageIndex > 0) {
      // Move back one stage in current round
      const newStage = stages[currentStageIndex - 1]
      if (newStage) {
        // Add type guard
        gameState.stage = newStage
        updateURL(gameState.currentRound, gameState.stage)
      }
    } else if (gameState.currentRound > 1) {
      // Move to scoreboard of previous round
      gameState.currentRound -= 1
      gameState.stage = 'scoreboard'
      updateURL(gameState.currentRound, 'scoreboard')
    } else {
      // At start of game, go home
      goto('/')
      return
    }

    gameState = { ...gameState }
    setGameState(gameState)
  }
</script>

<div class="page">
  <header class="container">
    <div class="progress-section">
      <progress value={gameProgress} max="100"></progress>
      <progress value={stageProgress} max="100"></progress>
    </div>
    {#if gameState}
      <small>
        Round {gameState.currentRound} of {gameState.totalRounds} - {getStageName(
          gameState.stage,
        )}
      </small>
    {/if}
  </header>

  <main class="container">
    {#if gameState}
      {#if gameState.stage === 'deal'}
        <DealStage
          currentRound={gameState.currentRound}
          players={gameState.players}
        />
      {:else if gameState.stage === 'guess'}
        <GuessStage
          currentRound={gameState.currentRound}
          players={gameState.players}
          guesses={currentGuesses}
          onGuessChange={handleGuessChange}
          config={gameState.config}
        />
      {:else if gameState.stage === 'play'}
        <PlayStage
          currentRound={gameState.currentRound}
          players={gameState.players}
          guesses={currentGuesses}
        />
      {:else if gameState.stage === 'result'}
        <ResultsStage
          currentRound={gameState.currentRound}
          players={gameState.players}
          guesses={currentGuesses}
          tricks={currentTricks}
          rounds={gameState.rounds}
          onTrickChange={handleTrickChange}
          onScoreChange={(player, score) => {
            if (gameState && currentRound) {
              currentRound.scores[player] = score
              gameState = { ...gameState }
              setGameState(gameState)
            }
          }}
        />
      {:else if gameState.stage === 'scoreboard'}
        <ScoreboardStage
          currentRound={gameState.currentRound}
          players={gameState.players}
          rounds={gameState.rounds}
          totalRounds={gameState.totalRounds}
          gameUpdatedAt={gameState.lastUpdated}
        />
      {/if}
    {/if}
  </main>

  <footer class="container">
    {#if gameState}
      {#if gameState.stage === 'scoreboard' && gameState.currentRound !== gameState.totalRounds}
        <button class="outline" on:click={() => (activeModal = 'finishEarly')}>
          Finish game early
        </button>
      {:else if gameState.stage === 'scoreboard' && gameState.currentRound === gameState.totalRounds}
        <button
          class="outline"
          on:click={() => {
            clearGameState()
            goto('/')
          }}
        >
          Go to home
        </button>
      {/if}

      <div class="buttons">
        {#if gameState.currentRound === 1 && gameState.stage === 'deal'}
          <button class="outline" on:click={() => (activeModal = 'stopGame')}>
            Stop game
          </button>
        {:else}
          <button class="outline" on:click={handleBack}>Back</button>
        {/if}

        <button
          on:click={proceed}
          disabled={!canProceed()}
          class={gameState.stage === 'result' ||
          (gameState.stage === 'scoreboard' &&
            gameState.totalRounds === gameState.currentRound)
            ? 'primary'
            : ''}
        >
          {getButtonText(
            gameState.stage,
            gameState.totalRounds,
            gameState.currentRound,
          )}
        </button>
      </div>
    {/if}
  </footer>
</div>

<!-- Add modals -->
{#if activeModal === 'stopGame'}
  <Modal
    title="Stop the game?"
    message="Are you sure you want to stop the game? This will end and not save the current game. You will be returned to the home screen."
    primaryText="Stop game"
    primaryAction={handleStopGame}
    secondaryText="Keep playing"
    secondaryAction={() => (activeModal = null)}
    open={true}
  />
{:else if activeModal === 'finishEarly'}
  <Modal
    title="Finish Game Early"
    message="Are you sure you want to finish the game early? This will end and save the current game. You will be returned to the home screen."
    primaryText="Finish game"
    primaryAction={handleFinishEarly}
    secondaryText="Keep playing"
    secondaryAction={() => (activeModal = null)}
    open={true}
  />
{/if}

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

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
