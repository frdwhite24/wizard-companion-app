<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  export let title: string
  export let message: string
  export let primaryAction: () => void
  export let primaryText: string
  export let secondaryAction: (() => void) | null = null
  export let secondaryText: string | null = null
  export let open = false

  function handleClose() {
    open = false
  }

  function handleBackdropClick(e: MouseEvent) {
    // Check if click was directly on the dialog element (backdrop)
    if (e.target === e.currentTarget) {
      if (secondaryAction) {
        secondaryAction()
      }
    }
  }

  onMount(() => {
    if (open) {
      document.documentElement.classList.add('modal-is-open')
    }
  })

  onDestroy(() => {
    document.documentElement.classList.remove('modal-is-open')
  })

  $: if (open) {
    document.documentElement.classList.add('modal-is-open')
  } else {
    document.documentElement.classList.remove('modal-is-open')
  }
</script>

// Requirements: - Title prop - Content/message prop - Primary action button
text & callback - Secondary action button text & callback (optional) - Close
button in header - Proper animations for open/close - Prevent background
scrolling when open

<dialog {open} on:click={handleBackdropClick}>
  <article>
    <h3>{title}</h3>
    <p>{message}</p>
    <footer>
      {#if secondaryAction && secondaryText}
        <button class="outline" on:click={secondaryAction}
          >{secondaryText}</button
        >
      {/if}
      <button on:click={primaryAction}>{primaryText}</button>
    </footer>
  </article>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
</style>
