<script lang="ts">
  import { onMount } from 'svelte'
  import { registerServiceWorker, updateThemeColor } from '$lib/pwa'
  import '../app.css'
  import { browser } from '$app/environment'
  import posthog from 'posthog-js'

  onMount(() => {
    if (browser) {
      posthog.init('phc_9e5NLbGFPNnQ5eUWMheIPXin3agu1ZrSuAGJWnho0Mn', {
        api_host: 'https://eu.i.posthog.com',
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      })
    }

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
