<script lang="ts">
  import { loadGameHistory } from '$lib/gameHistory'

  $: gameHistory = loadGameHistory()
  $: allHistoricalScores = gameHistory
    .flatMap((game) =>
      game.scores.map((score) => ({
        player: score.player,
        score: score.score,
        correctGuesses: score.correctGuesses,
        gameId: game.id,
        date: new Date(game.date),
      })),
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  $: highestScore =
    allHistoricalScores.length > 0
      ? Math.max(...allHistoricalScores.map((s) => s.score))
      : 0
  $: lowestScore =
    allHistoricalScores.length > 0
      ? Math.min(...allHistoricalScores.map((s) => s.score))
      : 0
  $: highestScoreRecord = allHistoricalScores.find(
    (s) => s.score === highestScore,
  )
  $: lowestScoreRecord = allHistoricalScores.find(
    (s) => s.score === lowestScore,
  )
  $: mostCorrectGuesses =
    allHistoricalScores.length > 0
      ? Math.max(...allHistoricalScores.map((s) => s.correctGuesses))
      : 0
  $: leastCorrectGuesses =
    allHistoricalScores.length > 0
      ? Math.min(...allHistoricalScores.map((s) => s.correctGuesses))
      : 0
  $: mostCorrectGuessesRecord = allHistoricalScores.find(
    (s) => s.correctGuesses === mostCorrectGuesses,
  )
  $: leastCorrectGuessesRecord = allHistoricalScores.find(
    (s) => s.correctGuesses === leastCorrectGuesses,
  )
</script>

<div class="page">
  <main class="container">
    <h1>Game Records</h1>

    <div class="records">
      <div class="record-card high">
        <div class="record-label">Highest Score</div>
        <div class="record-value">{highestScore}</div>
        <div class="record-details">
          {highestScoreRecord?.player} on {highestScoreRecord?.date.toLocaleDateString()}
        </div>
      </div>
      <div class="record-card low">
        <div class="record-label">Lowest Score</div>
        <div class="record-value">{lowestScore}</div>
        <div class="record-details">
          {lowestScoreRecord?.player} on {lowestScoreRecord?.date.toLocaleDateString()}
        </div>
      </div>
      <div class="record-card high">
        <div class="record-label">Most Correct Guesses</div>
        <div class="record-value">{mostCorrectGuesses}</div>
        <div class="record-details">
          {mostCorrectGuessesRecord?.player} on {mostCorrectGuessesRecord?.date.toLocaleDateString()}
        </div>
      </div>
      <div class="record-card low">
        <div class="record-label">Least Correct Guesses</div>
        <div class="record-value">{leastCorrectGuesses}</div>
        <div class="record-details">
          {leastCorrectGuessesRecord?.player} on {leastCorrectGuessesRecord?.date.toLocaleDateString()}
        </div>
      </div>
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

  .records {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }

  .record-card {
    padding: 1rem;
    border-radius: var(--pico-border-radius);
    text-align: center;
  }

  .record-card.high {
    background: rgba(52, 211, 153, 0.1);
    color: var(--high-score-color, rgb(23, 95, 69));
  }

  .record-card.low {
    background: rgba(239, 68, 68, 0.1);
    color: var(--low-score-color, rgb(147, 42, 42));
  }

  .record-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .record-value {
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .record-details {
    font-size: 0.85rem;
    opacity: 0.8;
    line-height: 1.4;
  }

  a[role='button'] {
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

  @media (prefers-color-scheme: light) {
    * {
      --high-score-color: rgb(23, 95, 69);
      --low-score-color: rgb(147, 42, 42);
    }
  }

  @media (prefers-color-scheme: dark) {
    * {
      --high-score-color: rgb(74, 222, 128);
      --low-score-color: rgb(248, 113, 113);
    }
  }
</style>
