<script lang="ts">
  import { onMount } from 'svelte'
  import { registerServiceWorker, updateThemeColor } from '$lib/pwa'
  import '../app.css'

  onMount(() => {
    registerServiceWorker()
    updateThemeColor()

    // Update theme color when color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateThemeColor)

    return () => {
      mediaQuery.removeEventListener('change', updateThemeColor)
    }
  })
</script>

<div class="wrapper" data-sveltekit-preload-data>
  <slot />
</div>

<style>
  .wrapper {
    height: 100dvh;
    padding: 1.6rem 0rem;
    padding-bottom: calc(1.6rem + env(safe-area-inset-bottom));
  }
</style>
