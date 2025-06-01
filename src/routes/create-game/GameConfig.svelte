<script lang="ts">
  import type { GameConfig } from '$lib/utils/types/gameConfig'
  import {
    getUserGameConfig,
    setUserGameConfig,
  } from '$lib/storage/userSettings'

  export let config: GameConfig
  export let onChange: (config: GameConfig) => void

  // Load initial config from user preferences
  $: {
    const userConfig = getUserGameConfig()
    if (config.guessRestrictionEnabled !== userConfig.guessRestrictionEnabled) {
      onChange({
        ...config,
        guessRestrictionEnabled: userConfig.guessRestrictionEnabled,
      })
    }
  }

  function handleGuessRestrictionChange(enabled: boolean) {
    const newConfig = {
      ...config,
      guessRestrictionEnabled: enabled,
    }
    // Update both game state and user preferences
    onChange(newConfig)
    setUserGameConfig(newConfig)
  }
</script>

<h1>Game configuration</h1>

<div class="config-section">
  <label>
    <input
      name="restriction-toggle"
      type="checkbox"
      role="switch"
      checked={config.guessRestrictionEnabled}
      on:change={() =>
        handleGuessRestrictionChange(!config.guessRestrictionEnabled)}
    />
    <p>
      {#if config.guessRestrictionEnabled}
        Total guesses cannot equal the number of cards in play
      {:else}
        Players can make any valid guesses, even if total equals cards in play
      {/if}
    </p>
  </label>
</div>

<style>
  .config-section {
    margin-top: 2rem;
  }
</style>
