# Wizard Card Game Helper Application

## Overview

A lightweight application to assist in playing the Wizard card game, created to avoid ad-supported alternatives and provide custom functionality.

## Core Requirements

- Help players track scores during Wizard card game sessions
- Ad-free experience
- Lightweight and easy to use
- Local-first storage approach:
  - Save all game data in browser storage
  - Persist data between sessions
  - No server-side storage required
  - Immediate data availability

## Detailed Requirements

_To be expanded as requirements are gathered_

### Game Setup

- Allow players to input participant names
- Support multiple players in a game session

### Score Tracking

_To be added_

### User Interface

- Clean, intuitive interface
- Mobile-friendly design

## Technical Requirements

- Built with SvelteKit
- TypeScript for type safety
- No external ads or tracking
- Mobile-first approach, deferring desktop considerations
- Using Pico CSS for styling:
  - Leverage semantic HTML elements
  - No custom styling initially - rely on Pico's defaults
  - Take advantage of Pico's built-in responsiveness
  - Class-light approach, preferring semantic HTML elements
- Fully client-side application:
  - No server dependencies
  - All routes prerendered
  - SSR disabled
  - Static site deployable
  - Works offline after initial load

## Technical Decisions & Rationale

1. **Styling Approach**

   - Using Pico CSS for its semantic-first approach
   - Minimal class usage, letting HTML elements carry meaning
   - No custom CSS until absolutely necessary
   - Automatic responsive behavior through Pico's defaults
   - When unsure about Pico styling:

     - Ask for clarification rather than guessing
     - Document confirmed styling patterns for future reference

   - Svelte-specific styling rules:
     - Use Svelte's <style> tag for component-specific styles
     - Avoid inline styles for maintainability and consistency
     - Styles are automatically scoped to the component
   - Pico CSS class usage:
     - Use `outline` class for secondary/subtle buttons
     - Document other Pico utility classes as we use them
   - Spacing conventions:
     - Use rems for consistent vertical rhythm
     - 2rem for major sections
     - 0.5rem for related elements (like player tags)

2. **Mobile First**

   - Initial development focused exclusively on mobile experience
   - Desktop considerations deferred for future iterations
   - Leveraging Pico's built-in responsive scaling

3. **Storage Strategy**

   - Using browser's localStorage for data persistence:
     - Simple key-value storage sufficient for game data
     - Synchronous access for better UX
     - Built-in string serialization/deserialization
     - Easy debugging via browser dev tools
     - Estimated storage needs:
       - Player names (small strings)
       - Game scores (small numbers)
       - Game history (compact per-game data)
     - Total storage well within localStorage 5-10MB limit
   - Zod for type-safe data validation:
     - Runtime validation of stored data
     - TypeScript type inference from schemas
     - Safe parsing of potentially corrupted storage

4. **Client-Side Architecture**

   - Using SvelteKit with:
     - `prerender = true` to generate static HTML
     - `ssr = false` to disable server-side rendering
     - All data stored in localStorage
     - No API dependencies
   - Development vs Production:
     - Development still requires Vite dev server for HMR and serving files
     - Production will be completely static with no server
     - `server.host: true` needed for development with tools like ngrok
   - Benefits:
     - Simple deployment to any static hosting
     - Works offline
     - No backend maintenance
     - Fast initial load with prerendered content

5. **Game State Management**
   - Create Game State:
     - Stored in localStorage under 'createGameState' key
     - Structure:
       ```typescript
       interface CreateGameState {
         step: number
         players: string[]
         lastUpdated: number // timestamp for potential cleanup
       }
       ```
     - Persists between browser sessions
     - Automatically loads previous state on page load
     - Updates localStorage on every state change
   - URL State:
     - Step number still reflected in URL for sharing/navigation
     - URL state syncs with localStorage state
     - URL changes don't override stored player data
   - State Lifecycle:
     - Created when first player added
     - Updated on all player changes
     - Cleared when game starts
     - Potentially cleaned up if abandoned (based on lastUpdated)
   - State Validation:
     - Validate step against player count on page load
     - Redirect to step 1 if:
       - Not enough players for current step
       - Invalid step number
       - Missing required configuration
     - Prevent URL manipulation bypassing requirements

### Game Setup Flow

1. **Home Page**

   - Primary action: "Start new game"
   - Secondary action: "Continue game setup" (when applicable)
   - Continue button only shown if:
     - Game setup exists in localStorage
     - Setup hasn't been completed
   - Starting new game:
     - Clears any existing setup state
     - Redirects to step 1 of setup

2. **Step 1: Add Players**

   - Input field for player names
   - Add player button
   - Players displayed as removable buttons
   - Progress bar at 33%
   - Title: "Who are you playing with?"
   - Subtitle: "Choose between 3-6 players"
   - Validation:
     - Minimum 3 players required to proceed
     - Maximum 6 players allowed
   - Continue button disabled if player count invalid
   - State Persistence:
     - Player list saved to localStorage
     - Restored on page reload
     - Maintains player order

3. **Step 2: Seating Order**

   - Progress bar at 66%
   - Title: "Where are they sitting?"
   - Subtitle: "Arrange players clockwise to determine dealing order"
   - Vertical list of player names
   - Each row contains:
     - Player name
     - Up arrow button (except first player)
     - Down arrow button (except last player)
   - Row reordering:
     - Natural slide animation when swapping positions
     - Mobile-focused interaction (no keyboard controls)
   - Order determines:
     - Shuffling responsibility
     - Dealing order
     - Play order
   - State Persistence:
     - Order changes saved to localStorage
     - Restored on page reload
     - Maintains animation capabilities

4. **Step 3: Game Confirmation**
   - Progress bar at 100%
   - Title: "Is this correct?"
   - Game summary display:
     - Total number of players
     - Number of rounds (60 divided by player count)
   - Player order display:
     - Ordered list of all players
     - Player names truncate with ellipsis if too long
     - Each player gets a unique role:
       - First player: "Dealing the pack"
       - Second player: "Guessing first"
       - Others: Random witty role descriptions
   - Final CTA:
     - Button text: "Start game!"
     - Starts the actual game
     - Clears setup state
   - State Persistence:
     - Maintains all previous configuration
     - Cleared only when game starts

### Layout & Navigation

1. **Mobile-First Layout**

   - Fixed header with progress bar
   - Scrollable main content
   - Sticky footer with CTA
   - Full viewport height utilization
   - Proper handling of overflow content

2. **Browser Navigation**

   - Step number stored in URL
   - Back/forward navigation supported
   - State validation on navigation:
     - Prevents invalid step access
     - Redirects to appropriate step
   - Scroll position reset on step change

3. **State Management**
   - localStorage for persistence
   - URL for deep linking
   - State validation on:
     - Page load
     - Navigation
     - Step transitions
   - Cleanup on:
     - Game start
     - New game creation

### Game Flow

1. **Round Structure**
   Each round consists of four stages:

   - Deal Stage
   - Guessing Stage
   - Playing Stage
   - Results Stage

2. **Deal Stage**

   - Display current dealer
   - Show number of cards being dealt
   - Dealer rotates clockwise each round
   - First dealer determined by initial player order

3. **Guessing Stage**

   - Players guess in clockwise order, starting after dealer
   - Each player inputs predicted number of tricks they'll win
   - Input controls:
     - Minus button
     - Current guess value
     - Plus button
   - Final player's guess restricted:
     - Cannot make total guesses equal round number
     - Show forbidden value clearly
   - Display all players in clockwise order
   - Highlight current guesser

4. **Playing Stage**

   - Display all players' guesses
   - Maintain clockwise order display

5. **Results Stage**

   - Show original guesses
   - Input controls for actual tricks won:
     - Minus button
     - Actual tricks value (initially set to their guess)
     - Plus button
   - Score calculation:
     - Correct guess: +20 points base
     - Per trick won: +10 points
     - Incorrect guess: -10 points per trick difference
   - Score display:
     - Previous total score
     - Round differential
     - New total score
     - Example: "170 + 50" or "220 - 10"
   - CTA to proceed to next round

6. **Round Progression**

   - Dealer advances clockwise each round
   - Card count changes each round:
     - Round number equals cards dealt
     - Total tricks available equals cards dealt
   - Maintain player order throughout game
   - Track running scores across rounds

7. **State Management**
   - Store current stage
   - Track dealer position
   - Save guesses
   - Record actual tricks
   - Calculate and store scores
   - Persist game progress

## Future Learnings & Updates

- Storage requirements may need review if:
  - Game history grows extremely large
  - We add additional features requiring more storage
  - We need complex querying of historical data

## Questions to Clarify

1. How many players does the game need to support?
2. What specific scoring rules need to be implemented?
3. What are the key pain points with existing solutions that we need to address?
4. Are there any specific game mechanics that need special attention?

## Development Rules & Guidelines

1. Always refer back to this document when:

   - Making architectural decisions
   - Feeling unsure about direction
   - Needing to validate features
   - Getting lost in implementation details

2. Document new learnings and insights:

   - Update requirements based on new information
   - Record technical decisions and their rationale
   - Note any discovered constraints or limitations
   - Document game rules and edge cases as they are uncovered

3. Keep code simple and maintainable:

   - Avoid type assertions in TypeScript
   - Prefer asking clarifying questions over making assumptions
   - Make small, focused changes with clear intent

4. Component Structure & Layout:
   - Maintain existing layout structure in main page components
   - Preserve the wrapper/content hierarchy for proper spacing
   - Make component extractions without disrupting main page layout
   - Test layout implications before making structural changes

## Component Structure

- Follow Svelte's component organization:
  - <script> tag first
  - Template markup second
  - <style> tag last
- Keep related functionality grouped together

## Styling

- Use Pico CSS violet color scheme
- Use predefined Pico CSS color classes:
  - `pico-color-violet-{50-950}` for text colors
  - `pico-background-violet-{50-950}` for backgrounds
  - For subtle borders/lines use rgba with violet base color (147, 51, 234)
- No CSS variables should be used - rely on Pico's predefined classes instead
- Avoid setting colors in CSS directly, use Pico's classes
- When a new color is needed, ask for the appropriate Pico CSS class name
- Never guess or use CSS variables without explicit confirmation
- Never use negative margins or padding - use positive spacing and proper container structure instead

### Game Scoring & Ranking Rules

1. **Primary Ranking: Total Score**

   - Higher cumulative score ranks better
   - Score calculation per round:
     - Correct guess: +20 points base + (10 × tricks won)
     - Incorrect guess: -10 points per trick difference

2. **Tiebreaker: Correct Rounds**

   - When total scores are equal, player with more correct guesses ranks higher
   - Correct guess means actual tricks won equals predicted tricks

3. **Position Sharing**
   - Players with equal scores and equal correct rounds share the same position
   - Medal distribution:
     - Multiple players can receive the same medal
     - Next position(s) are skipped for shared positions
     - Example: Two 1st places → next player gets 2nd place medal

## UI Patterns

### Scrollable Tables with Sticky Columns

1. **Sticky Column**

   - Left-most column remains fixed while content scrolls
   - Maintains consistent background color
   - Z-index ensures column stays above scrolling content

2. **Fade Effects**
   - Fade appears on right edge of sticky column
   - Extends full height of scrollable area
   - Indicates content scrolls underneath sticky column
   - Only visible when content is scrollable
   - Uses contrast background color for gradient
