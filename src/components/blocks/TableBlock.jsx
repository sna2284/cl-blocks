import { Button } from '@/components/ui/button'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, LayoutGrid, MoreVertical, Settings2, Table as TableIcon, PieChart as PieChartIcon, Link, Copy, X, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect, useRef, useMemo } from 'react'
import html2canvas from 'html2canvas'

export default function TableBlock({ block, onUpdate, onOpenSidepanel, isReadOnly = false, isReadOnlyModified = false }) {
  const [isViewGroupOpen, setIsViewGroupOpen] = useState(block.isViewGroupOpen || false)
  const blockRef = useRef(null)
  const data = block.data || {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
    ],
  }
  const title = block.title || ''

  // Sync state when block prop changes (e.g., after type conversion)
  useEffect(() => {
    if (block.isViewGroupOpen !== undefined) {
      setIsViewGroupOpen(block.isViewGroupOpen)
    }
  }, [block.isViewGroupOpen])

  const handleTitleChange = (e) => {
    if (isReadOnly) return
    if (onUpdate) {
      onUpdate({ ...block, title: e.target.value })
    }
  }

  const handleViewTypeChange = (type) => {
    if (onUpdate) {
      if (type === 'line' || type === 'bar' || type === 'pie' || type === 'advanced') {
        // Convert table to chart
        // First column is dimension, rest are metrics
        const metrics = data.headers.slice(1)
        const chartData = data.rows.map((row) => {
          const dataPoint = { name: row[0] || 'Unknown' }
          metrics.forEach((metric, index) => {
            // Remove formatting and parse value
            const rawValue = row[index + 1]?.toString().replace(/[$,%]/g, '') || '0'
            dataPoint[metric] = parseFloat(rawValue) || 0
          })
          // Keep 'value' for backward compatibility (use first metric)
          dataPoint.value = dataPoint[metrics[0]] || 0
          return dataPoint
        })
        // Generate title based on metrics and dimensions
        const dimensionType = data.headers[0]?.toLowerCase() || 'dimension'
        const dimensions = { type: dimensionType, values: data.rows.map(row => row[0]) }
        const generateTitle = (metrics, dimensions) => {
          const dimensionLabel = dimensions.type.charAt(0).toUpperCase() + dimensions.type.slice(1)
          const metricsLabel = metrics.length === 1 
            ? metrics[0]
            : metrics.length === 2
            ? `${metrics[0]} and ${metrics[1]}`
            : `${metrics.slice(0, -1).join(', ')}, and ${metrics[metrics.length - 1]}`
          return `${metricsLabel} by ${dimensionLabel}`
        }
        const newTitle = generateTitle(metrics, dimensions)
        onUpdate({ ...block, type: 'chart', chartType: type, data: chartData, metrics, title: newTitle, isViewGroupOpen: block.isViewGroupOpen })
      }
      // If type is 'table', do nothing (already a table)
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
      const sanitizedTitle = (title || 'table').replace(/[^a-z0-9]/gi, '_').toLowerCase()
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

  // Convert table data format to TanStack Table format
  const columns = useMemo(() => {
    if (!data?.headers || data.headers.length === 0) {
      return [{
        accessorKey: 'col0',
        header: 'Column 1',
      }]
    }
    return data.headers.map((header, index) => ({
      accessorKey: `col${index}`,
      header: header || `Column ${index + 1}`,
    }))
  }, [data?.headers])

  const tableData = useMemo(() => {
    if (!data?.rows || !data?.headers || data.headers.length === 0) {
      return []
    }
    return data.rows.map((row) => {
      const rowObj = {}
      data.headers.forEach((header, index) => {
        rowObj[`col${index}`] = row?.[index] ?? ''
      })
      return rowObj
    })
  }, [data?.rows, data?.headers])

  const table = useReactTable({
    data: tableData || [],
    columns: columns.length > 0 ? columns : [{ accessorKey: 'col0', header: 'Column 1' }],
    getCoreRowModel: getCoreRowModel(),
  })

  // Safety check - ensure we have valid data structure
  if (!data || typeof data !== 'object') {
    return (
      <div className="block-wrapper my-4 mx-4" ref={blockRef}>
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">Invalid table data</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="block-wrapper my-4 mx-4" ref={blockRef}>
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Table title"
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
                className="h-8 w-8 p-0 bg-accent"
                onClick={() => {
                  handleViewTypeChange('table')
                }}
              >
                <TableIcon className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  handleViewTypeChange('line')
                }}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  handleViewTypeChange('bar')
                }}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  handleViewTypeChange('pie')
                }}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  handleViewTypeChange('advanced')
                }}
              >
                <LayoutGrid className="h-4 w-4" />
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length || 1}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

