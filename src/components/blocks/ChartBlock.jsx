import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BarChart3, LayoutGrid, MoreVertical, Settings2, Table as TableIcon, PieChart as PieChartIcon, Link, Copy, X, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'

export default function ChartBlock({ block, onUpdate, onOpenSidepanel, isReadOnly = false, isReadOnlyModified = false }) {
  const [isViewGroupOpen, setIsViewGroupOpen] = useState(block.isViewGroupOpen || false)
  const [hiddenMetrics, setHiddenMetrics] = useState(new Set())
  const chartType = block.chartType || 'line'
  const blockRef = useRef(null)

  // Sync state when block prop changes (e.g., after type conversion)
  useEffect(() => {
    if (block.isViewGroupOpen !== undefined) {
      setIsViewGroupOpen(block.isViewGroupOpen)
    }
  }, [block.isViewGroupOpen])
  const data = block.data || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 278 },
    { name: 'May', value: 189 },
  ]
  const title = block.title || ''

  const handleTitleChange = (e) => {
    if (isReadOnly) return
    if (onUpdate) {
      onUpdate({ ...block, title: e.target.value })
    }
  }

  const handleChartTypeChange = (type) => {
    if (onUpdate) {
      if (type === 'table') {
        // Convert chart to table
        const headers = ['Name', ...metrics.length > 0 ? metrics : ['Value']]
        const rows = data.map(item => {
          const row = [item.name]
          if (metrics.length > 0) {
            metrics.forEach(metric => {
              row.push(item[metric]?.toString() || '0')
            })
          } else {
            row.push(item.value?.toString() || '0')
          }
          return row
        })
        const tableData = { headers, rows }
        // Generate title based on metrics and dimensions
        const currentMetrics = metrics.length > 0 ? metrics : ['Value']
        const dimensionType = 'dimension'
        const dimensions = { type: dimensionType, values: data.map(d => d.name) }
        const generateTitle = (metrics, dimensions) => {
          const dimensionLabel = dimensions.type.charAt(0).toUpperCase() + dimensions.type.slice(1)
          const metricsLabel = metrics.length === 1 
            ? metrics[0]
            : metrics.length === 2
            ? `${metrics[0]} and ${metrics[1]}`
            : `${metrics.slice(0, -1).join(', ')}, and ${metrics[metrics.length - 1]}`
          return `${metricsLabel} by ${dimensionLabel}`
        }
        const newTitle = generateTitle(currentMetrics, dimensions)
        onUpdate({ ...block, type: 'table', data: tableData, title: newTitle, isViewGroupOpen: block.isViewGroupOpen })
      } else {
        onUpdate({ ...block, chartType: type, isViewGroupOpen: block.isViewGroupOpen })
      }
    }
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}${window.location.pathname}#${block.id}`
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy link:', err)
      toast.error('Failed to copy link')
    }
  }

  const handleTakeSnapshot = async () => {
    if (!blockRef.current) return

    try {
      // Capture the block excluding controls
      const canvas = await html2canvas(blockRef.current, {
        ignoreElements: (element) => {
          // Exclude the controls div using data attribute
          return element.getAttribute && element.getAttribute('data-snapshot-exclude') === 'true'
        },
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      })

      // Generate filename: block title + timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const sanitizedTitle = (title || 'chart').replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `${sanitizedTitle}_${timestamp}.jpg`

      // Convert canvas to PNG blob for clipboard (PNG is more widely supported)
      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png')
      })

      // Copy to clipboard using ClipboardItem API with PNG (more compatible)
      try {
        const clipboardItem = new ClipboardItem({ 
          'image/png': Promise.resolve(pngBlob)
        })
        await navigator.clipboard.write([clipboardItem])
        toast.success('Snapshot copied to clipboard')
      } catch (clipboardErr) {
        console.error('ClipboardItem with Promise failed, trying direct blob:', clipboardErr)
        // Try without Promise wrapper
        try {
          const clipboardItem = new ClipboardItem({ 
            'image/png': pngBlob
          })
          await navigator.clipboard.write([clipboardItem])
          toast.success('Snapshot copied to clipboard')
        } catch (directErr) {
          console.error('Direct blob also failed, trying data URL fallback:', directErr)
          // Fallback: convert to data URL and fetch as blob
          try {
            const dataUrl = canvas.toDataURL('image/png')
            const response = await fetch(dataUrl)
            const blobFromDataUrl = await response.blob()
            const clipboardItem = new ClipboardItem({
              'image/png': Promise.resolve(blobFromDataUrl)
            })
            await navigator.clipboard.write([clipboardItem])
            toast.success('Snapshot copied to clipboard')
          } catch (fallbackErr) {
            console.error('All copy methods failed:', fallbackErr)
            toast.error('Failed to copy snapshot. Please check browser permissions.')
          }
        }
      }
    } catch (err) {
      console.error('Failed to take snapshot:', err)
      toast.error('Failed to take snapshot')
    }
  }

  // Extract metrics from block.metrics or data keys
  const metrics = block.metrics || (data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'name' && key !== 'value')
    : ['value'])
  
  // Build chart config for all metrics using CSS variables (supports dark mode)
  const chartConfig = {}
  metrics.forEach((metric, index) => {
    const colorIndex = index % 5
    chartConfig[metric] = {
      label: metric,
      color: `hsl(var(--chart-${colorIndex + 1}))`, // Uses CSS variables that change with dark mode
    }
    // Use CSS variable for stroke/fill (will adapt to dark mode)
    chartConfig[metric].actualColor = `hsl(var(--chart-${colorIndex + 1}))`
  })
  // Keep 'value' for backward compatibility
  if (!chartConfig.value && metrics.length === 0) {
    chartConfig.value = {
      label: 'Value',
      color: 'hsl(var(--chart-1))',
      actualColor: chartColors[0],
    }
  }

  const handleLegendClick = (metric) => {
    setHiddenMetrics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(metric)) {
        newSet.delete(metric)
      } else {
        newSet.add(metric)
      }
      return newSet
    })
  }

  // Helper to extract item config from a payload (similar to chart.jsx)
  const getPayloadConfigFromPayload = (config, payload, key) => {
    if (typeof payload !== "object" || payload === null) {
      return undefined
    }

    const payloadPayload =
      "payload" in payload &&
      typeof payload.payload === "object" &&
      payload.payload !== null
        ? payload.payload
        : undefined

    let configLabelKey = key

    if (
      key in payload &&
      typeof payload[key] === "string"
    ) {
      configLabelKey = payload[key]
    } else if (
      payloadPayload &&
      key in payloadPayload &&
      typeof payloadPayload[key] === "string"
    ) {
      configLabelKey = payloadPayload[key]
    }

    return configLabelKey in config
      ? config[configLabelKey]
      : config[key]
  }

  const CustomLegendContent = ({ payload }) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div className="flex items-center justify-center gap-4 pt-3">
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(chartConfig, item, key)
            const isHidden = hiddenMetrics.has(key)
            
            return (
              <div
                key={item.value || key}
                onClick={() => handleLegendClick(key)}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: isHidden ? 'hsl(var(--muted-foreground))' : item.color,
                      opacity: isHidden ? 0.5 : 1,
                    }} />
                )}
                <span className={isHidden ? 'line-through opacity-50' : ''}>
                  {itemConfig?.label || item.name}
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<CustomLegendContent />} />
              {metrics.length > 0 ? (
                metrics.map((metric, index) => {
                  const isHidden = hiddenMetrics.has(metric)
                  return (
                    <Line 
                      key={metric}
                      type="monotone" 
                      dataKey={metric} 
                      stroke={chartConfig[metric]?.actualColor || `var(--color-${metric})`}
                      strokeOpacity={isHidden ? 0 : 1}
                      hide={isHidden}
                    />
                  )
                })
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartConfig.value?.actualColor || "var(--color-value)"}
                  strokeOpacity={hiddenMetrics.has('value') ? 0 : 1}
                  hide={hiddenMetrics.has('value')}
                />
              )}
            </LineChart>
          </ChartContainer>
        )
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<CustomLegendContent />} />
              {metrics.length > 0 ? (
                metrics.map((metric, index) => {
                  const isHidden = hiddenMetrics.has(metric)
                  return (
                    <Bar 
                      key={metric}
                      dataKey={metric} 
                      fill={chartConfig[metric]?.actualColor || `var(--color-${metric})`}
                      fillOpacity={isHidden ? 0 : 1}
                      hide={isHidden}
                    />
                  )
                })
              ) : (
                <Bar 
                  dataKey="value" 
                  fill={chartConfig.value?.actualColor || "var(--color-value)"}
                  fillOpacity={hiddenMetrics.has('value') ? 0 : 1}
                  hide={hiddenMetrics.has('value')}
                />
              )}
            </BarChart>
          </ChartContainer>
        )
      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(var(--chart-${(index % 5) + 1}))`} 
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        )
      default:
        return null
    }
  }

  return (
    <div className="block-wrapper my-4 mx-4" ref={blockRef}>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Chart title"
          disabled={isReadOnly}
          className={`flex-1 min-w-0 text-lg font-semibold outline-none bg-transparent border-none focus:ring-0 p-0 disabled:cursor-default truncate ${isViewGroupOpen ? 'mr-[200px]' : ''}`}
        />
        <TooltipProvider>
          <div className="flex items-center gap-1 relative" data-snapshot-exclude="true">
            <div 
              className={`flex items-center gap-1 transition-all duration-300 ease-in-out absolute right-full mr-2 ${
                isViewGroupOpen 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${chartType === 'table' ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChartTypeChange('table')
                }}
              >
                <TableIcon className={`h-4 w-4 ${chartType === 'table' ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${chartType === 'line' ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChartTypeChange('line')
                }}
              >
                <BarChart3 className={`h-4 w-4 ${chartType === 'line' ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${chartType === 'bar' ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChartTypeChange('bar')
                }}
              >
                <BarChart3 className={`h-4 w-4 ${chartType === 'bar' ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${chartType === 'pie' ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChartTypeChange('pie')
                }}
              >
                <PieChartIcon className={`h-4 w-4 ${chartType === 'pie' ? 'text-primary' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${chartType === 'advanced' ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChartTypeChange('advanced')
                }}
              >
                <LayoutGrid className={`h-4 w-4 ${chartType === 'advanced' ? 'text-primary' : ''}`} />
              </Button>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const newState = !isViewGroupOpen
                    setIsViewGroupOpen(newState)
                    if (onUpdate) {
                      onUpdate({ ...block, isViewGroupOpen: newState })
                    }
                  }}
                >
                  {isViewGroupOpen ? (
                    <X className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                <p>Change view</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => onOpenSidepanel && onOpenSidepanel()}
                >
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white">
                <p>Analyse</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white">
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTakeSnapshot}>
                  <Camera className="h-4 w-4 mr-2" />
                  Take a snapshot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>
      <Card>
        <CardContent className="p-4 pt-10">
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  )
}

