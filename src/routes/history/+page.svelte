<script lang="ts">
  import { loadGameHistory } from '$lib/gameHistory'
  import type { GameSummary } from '$lib/gameHistory'
  import { goto } from '$app/navigation'

  const gameHistory = loadGameHistory()

  // Sort players by score and correct guesses for ties
  function getSortedPlayers(game: GameSummary) {
    return [...game.scores].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.correctGuesses - a.correctGuesses
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getPlayerPositions(scores: GameSummary['scores']) {
    const positions = new Map<string, number>()
    let currentPosition = 1
    const sortedPlayers = [...scores].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return b.correctGuesses - a.correctGuesses
    })

    for (let i = 0; i < sortedPlayers.length; i++) {
      const prev = sortedPlayers[i - 1]
      const curr = sortedPlayers[i]

      if (i > 0 && prev && curr) {
        if (
          prev.score !== curr.score ||
          prev.correctGuesses !== curr.correctGuesses
        ) {
          currentPosition = i + 1
        }
      }
      const player = sortedPlayers[i]
      if (player) {
        positions.set(player.player, currentPosition)
      }
    }
    return positions
  }
</script>

<div class="page">
  <header class="container">
    <h1>Game History</h1>
  </header>
  <main class="container">
    <div class="games">
      {#each gameHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as game}
        <article>
          <header>
            <div class="date">{formatDate(game.date)}</div>
            <div class="rounds">
              {game.rounds} round{game.rounds === 1 ? '' : 's'}
            </div>
          </header>

          <div class="scores">
            {#each getSortedPlayers(game) as player}
              {@const position = getPlayerPositions(game.scores).get(
                player.player,
              )}
              <div class="player">
                <div class="position">
                  {#if position === 1}
                    🥇
                  {:else if position === 2}
                    🥈
                  {:else if position === 3}
                    🥉
                  {/if}
                </div>
                <div class="name">{player.player}</div>
                <div class="stats">
                  <div
                    class="score"
                    class:positive={player.score > 0}
                    class:negative={player.score < 0}
                  >
                    {player.score}
                  </div>
                  <div class="guesses">
                    {player.correctGuesses} correct guess{player.correctGuesses ===
                    1
                      ? ''
                      : 'es'}
                  </div>
                </div>
              </div>
            {/each}
          </div>

          <footer>
            <button
              class="outline"
              on:click={() => {
                const createGameState = {
                  step: 2,
                  players: game.players,
                  lastUpdated: Date.now(),
                }
                localStorage.setItem(
                  'createGame',
                  JSON.stringify(createGameState),
                )
                goto('/create-game')
              }}
            >
              Rematch
            </button>
          </footer>
        </article>
      {/each}
    </div>
  </main>

  <footer class="container">
    <a href="/" role="button">Back to home</a>
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
  }

  footer {
    flex-shrink: 0;
    padding-top: 1rem;
  }

  .games {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  article {
    margin: 0;
  }

  article header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .date {
    font-weight: 500;
  }

  .rounds {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .scores {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .player {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
  }

  .position {
    font-size: 1.2rem;
    width: 1.5rem;
  }

  .name {
    font-weight: 500;
  }

  .stats {
    text-align: right;
  }

  .score {
    font-weight: 500;
    font-size: 1.1rem;
  }

  .guesses {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .positive {
    color: rgb(52, 211, 153); /* Green */
  }

  .negative {
    color: rgb(239, 68, 68); /* Red */
  }

  a[role='button'] {
    width: 100%;
  }

  article footer {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  article button {
    width: 100%;
  }

  @media (pointer: coarse) {
    main {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    main::-webkit-scrollbar {
      display: none;
    }
  }
</style>
