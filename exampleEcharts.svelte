<script lang="ts">
  import { onMount } from 'svelte'
  import {
    init,
    type EChartsOption,
    type EChartsType,
    type TooltipComponentOption,
  } from 'echarts'
  import {
    Card,
    LoadingIndicator,
  } from '@salzburg-ag-ds/at.salzburg-ag.ds.energy-communities.components-library/components'
  import { colors } from '@salzburg-ag-ds/at.salzburg-ag.ds.energy-communities.components-library/constants'
  import { Period } from '@salzburg-ag-ds/at.salzburg-ag.ds.energycommunities.consumption-client'
  import { ONE_DAY } from '@constants/dashboards'
  import { getDummyLoadingSeries } from './utils'
  import { locale } from '../../../../i18n'
  import { formatNumber } from '@salzburg-ag-ds/at.salzburg-ag.ds.energy-communities.components-library/utils'
  import DataNotFound from '@lib/components/data-refetch-dialog/DataNotFound.svelte'
  import DataRefetchDialog from '@lib/components/data-refetch-dialog/DataRefetchDialog.svelte'

  export let title: string
  export let subTitle: string | null = null
  export let dataSeries: EChartsOption['series']
  export let isLoading = false
  export let period: Period | null
  export let tooltipFormatter: TooltipComponentOption['formatter'] | undefined =
    undefined
  export let axisPointerLabelColours: {
    borderColor: string
    backgroundColor: string
    color: string
  }
  export let isNotFoundError = false
  export let isError = false
  export let onRefetchButtonClick: () => void = () => null

  const BREAKPOINT = 900
  const FONT_SIZE = {
    GRAPH_TITLE: 18,
    GRAPH_SUBTITLE: 16,
    AXIS_LABEL: 14,
    LEGEND: 16,
  }
  const TEXT_COLOUR = colors.neutral_3
  const CROSSHAIR_LINE_COLOUR = colors.neutral_1
  const AXIS_LABEL_MARGIN = 16
  const GRID_LINE_STYLE = {
    color: colors.neutral_5,
    width: 1,
    type: 'solid' as const,
    opacity: 0.6,
  }
  const AXIS_POINTER_LABEL_STYLE = {
    ...axisPointerLabelColours,
    borderWidth: 1,
    margin: 8,
    padding: 4,
    fontSize: 14,
  }

  let myChart: EChartsType
  let windowWidth = 0

  $: dateFormatOptions =
    period === Period.DAY
      ? ({ hour: 'numeric', minute: 'numeric' } as const)
      : ({
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        } as const)
  // NOTE: these properties have been separated out as they are derived. When these values change, they need to be reset
  // in the graph options
  $: zoomLimitMultiplier =
    period === Period.DAY ? 0.1 : period === Period.MONTH ? 5 : 1
  $: graphTitle = {
    title: {
      left: 'left',
      text: title,
      ...(subTitle ? { subtext: subTitle } : {}),
      textStyle: {
        fontSize: FONT_SIZE.GRAPH_TITLE,
      },
      subtextStyle: {
        fontSize: FONT_SIZE.GRAPH_SUBTITLE,
      },
    } satisfies EChartsOption['title'],
  }
  $: dataZoom = [
    {
      disabled: isLoading,
      type: 'inside',
      filterMode: 'none',
      start: 0,
      end: 100,
      startValue: 0,
      minValueSpan: ONE_DAY * zoomLimitMultiplier,
    },
    {
      show: false,
    },
  ] satisfies EChartsOption['dataZoom']
  $: tooltip = {
    show: !isLoading,
    z: 5,
    trigger: 'axis',
    confine: true,
    position: function (pt) {
      return [pt[0], '10%']
    },
    ...(tooltipFormatter ? { formatter: tooltipFormatter } : {}),
    axisPointer: {
      type: 'cross',
    },
  } satisfies EChartsOption['tooltip']
  $: grid = {
    bottom: windowWidth < BREAKPOINT ? '20%' : '10%',
    top: 80,
    left: 5,
    right: 5,
    containLabel: true,
  } satisfies EChartsOption['grid']
  $: xAxis = {
    type: 'time',
    boundaryGap: ['0%', '0%'],
    animation: false,
    axisLabel: {
      fontSize: FONT_SIZE.AXIS_LABEL,
      margin: AXIS_LABEL_MARGIN,
      hideOverlap: true,
      rotate: windowWidth < BREAKPOINT ? 45 : 0,
      formatter:
        period === Period.MONTH
          ? '{d}'
          : period === Period.DAY
            ? '{HH}:{mm}'
            : '{value}',
    },
    splitLine: {
      show: true,
      lineStyle: GRID_LINE_STYLE,
    },
    axisPointer: {
      zlevel: 10,
      lineStyle: {
        opacity: 1,
        color: CROSSHAIR_LINE_COLOUR,
        type: 'dashed',
      },
      label: {
        ...AXIS_POINTER_LABEL_STYLE,
        formatter: (params) =>
          new Date(params.value).toLocaleString($locale, dateFormatOptions),
      },
    },
  } satisfies EChartsOption['xAxis']
  $: {
    if (title || subTitle) {
      myChart?.setOption({ ...graphTitle })
    }
  }
  $: {
    if (windowWidth) {
      myChart?.setOption({ xAxis, grid })
      myChart?.resize()
      myChart?.updateLabelLayout()
    }
  }
  $: {
    if (isLoading) {
      myChart?.setOption(getDummyLoadingSeries())
      myChart?.showLoading({
        text: 'Wird geladen…',
        color: colors.primary,
      })
    } else {
      myChart?.setOption(
        { series: dataSeries, dataZoom, tooltip },
        { replaceMerge: ['series'] },
      )
      myChart?.hideLoading()
    }
  }

  onMount(() => {
    const chartDom = document.getElementById('energyChart')
    myChart = init(chartDom)

    const option: EChartsOption = {
      ...(dataSeries ? { series: dataSeries } : {}),
      dataZoom,
      xAxis,
      grid,
      legend: {
        show: true,
        bottom: 0,
        left: 0,
        textStyle: {
          fontSize: FONT_SIZE.LEGEND,
          color: TEXT_COLOUR,
        },
        lineStyle: {
          width: 0,
        },
      },
      timeline: {
        show: false,
      },
      toolbox: {
        show: false,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        animation: false,
        axisLabel: {
          formatter: function (value) {
            const decimals = value < 10 && value > 0 ? 2 : 0
            return (
              formatNumber(value, {
                decimals,
                locale: $locale,
              }) + ' kWh'
            )
          },
          fontSize: FONT_SIZE.AXIS_LABEL,
          margin: AXIS_LABEL_MARGIN,
        },
        splitLine: {
          show: true,
          lineStyle: GRID_LINE_STYLE,
        },
        axisPointer: {
          zlevel: 10,
          lineStyle: {
            color: CROSSHAIR_LINE_COLOUR,
            type: 'dashed',
          },
          label: {
            ...AXIS_POINTER_LABEL_STYLE,
            formatter: function (params) {
              const value = Number(params.value)

              if (Number.isNaN(value)) {
                // INFO: This would be a no-op. This case is not expected but is required to be fully type safe
                return `${params.value}`
              } else {
                const decimals = value < 10 && value > 0 ? 2 : 0
                return (
                  formatNumber(value, {
                    decimals,
                    locale: $locale,
                  }) + ' kWh'
                )
              }
            },
          },
        },
      },
      textStyle: {
        color: TEXT_COLOUR,
      },
    }

    myChart.setOption(option)
  })
</script>

<svelte:window bind:innerWidth={windowWidth} />

<Card margin="4rem 0 0">
  <div id="energyChart" class="chart">
    {#if isLoading}
      <div class="overlay">
        <LoadingIndicator color="primary" />
      </div>
    {:else if isNotFoundError}
      <div class="overlay">
        <DataNotFound {onRefetchButtonClick} />
      </div>
    {:else if isError}
      <div class="overlay">
        <DataRefetchDialog {onRefetchButtonClick} />
      </div>
    {/if}
  </div>
</Card>

<style>
  .chart {
    height: 500px;
    width: 100%;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
</style>
