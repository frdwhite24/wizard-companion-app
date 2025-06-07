<script lang="ts">
  import { onMount } from 'svelte'
  import { init, type EChartsType, type TooltipComponentOption } from 'echarts'
  import type { GameSummary } from '$lib/gameHistory'

  export let game: GameSummary

  const BREAKPOINT = 900
  const PLAYER_COLORS = [
    '#1f77b4', // blue
    '#ff7f0e', // orange
    '#2ca02c', // green
    '#d62728', // red
    '#9467bd', // purple
    '#e377c2', // pink/magenta
  ]

  let myChart: EChartsType
  let windowWidth = 0
  let series = []
  let xAxisData = []

  function calculateCumulativeScores() {
    if (!game.roundScores) return []

    const playerScores = new Map<string, number[]>()
    game.players.forEach((player) => {
      playerScores.set(player, [0]) // Start with 0
    })

    game.roundScores.forEach((round) => {
      round.scores.forEach((score) => {
        const currentScores = playerScores.get(score.player) || []
        const lastScore = currentScores[currentScores.length - 1] || 0
        playerScores.set(score.player, [
          ...currentScores,
          lastScore + score.score,
        ])
      })
    })

    return Array.from(playerScores.entries()).map(([player, scores]) => ({
      name: player,
      type: 'line',
      smooth: true,
      data: scores,
      color:
        PLAYER_COLORS[game.players.indexOf(player) % PLAYER_COLORS.length] ||
        '#000',
    }))
  }

  $: series = calculateCumulativeScores()
  $: xAxisData = game.roundScores
    ? Array.from({ length: game.roundScores.length + 1 }, (_, i) => i)
    : []

  const tooltipFormatter: TooltipComponentOption['formatter'] = (
    params: any,
  ) => {
    if (!Array.isArray(params) || !params.length) return ''
    const round = params[0].dataIndex
    // Sort params by score descending
    const sorted = [...params].sort((a, b) => Number(b.value) - Number(a.value))
    const lines = sorted.map((param) => {
      const player = param.seriesName
      const score = param.value
      return `<div style=\"display:flex;justify-content:space-between;align-items:center;\"><span style=\"font-weight:bold;\">${player}</span><span style=\"font-family:monospace;margin-left:1em;\">${score}</span></div>`
    })
    return (
      `<div style=\"font-weight:bold;font-size:1.1em;margin-bottom:0.5em;\">Round ${round}</div>` +
      lines.join('')
    )
  }

  let chartOption: any
  $: chartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: tooltipFormatter,
    },
    legend: {
      data: game.players,
      bottom: 0,
      textStyle: {
        color: 'var(--pico-color)',
      },
    },
    grid: {
      bottom: windowWidth < BREAKPOINT ? '20%' : '10%',
      top: 60,
      left: 5,
      right: 5,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: 'Round',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: 'Score',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series,
  }

  onMount(() => {
    const chartDom = document.getElementById(`scoreChart-${game.id}`)
    if (chartDom) {
      myChart = init(chartDom)
      myChart.setOption(chartOption)
    }
  })

  $: {
    if (myChart) {
      myChart.setOption(chartOption)
      myChart.resize()
    }
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div id={`scoreChart-${game.id}`} class="chart"></div>

<style>
  .chart {
    height: 400px;
    width: 100%;
  }
</style>
