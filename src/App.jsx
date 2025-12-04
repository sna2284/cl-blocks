import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Block from './components/Block'
import CommandMenu from './components/CommandMenu'
import AddBlockButton from './components/AddBlockButton'
import { loadFromStorage } from './hooks/useAutoSave'
import {
  loadReport,
  saveReport,
  loadAllReports,
  subscribeToReport,
  unsubscribeFromReport,
  generateReportId
} from './lib/reports'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./components/AppSidebar"
import { ChevronRight, X, Plus, Trash2, Send, Loader2, Eye, Building, LockKeyhole, MoreVertical, Star, ChevronDown, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// E-commerce metrics
const ecommerceMetrics = [
  'Revenue',
  'Sales',
  'Orders',
  'Conversion Rate',
  'Average Order Value',
  'Customer Acquisition Cost',
  'Return Rate',
  'Refund Rate',
  'Gross Profit',
  'Net Profit',
]

// Dimension types
const dimensionTypes = {
  time: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  region: ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'],
  campaign: ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D', 'Summer Sale', 'Winter Sale', 'Black Friday', 'Holiday Promo'],
  channel: ['Organic', 'Paid Search', 'Social Media', 'Email', 'Direct', 'Referral', 'Affiliate'],
  product: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Food'],
}

// Helper to get random dimension type and values
const getRandomDimensions = (min = 5, max = 10) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const dimensionType = Object.keys(dimensionTypes)[Math.floor(Math.random() * Object.keys(dimensionTypes).length)]
  const values = dimensionTypes[dimensionType].slice(0, count)
  return { type: dimensionType, values }
}

// Helper to format metric value
const formatMetricValue = (metric, value) => {
  if (metric.includes('Rate') || metric.includes('Conversion')) {
    return `${value.toFixed(2)}%`
  }
  if (metric.includes('Cost') || metric.includes('Value') || metric.includes('Profit') || metric === 'Revenue') {
    return `$${value.toLocaleString()}`
  }
  return value.toLocaleString()
}

// Helper to generate random value for a metric
const generateMetricValue = (metric, baseValue = null) => {
  if (baseValue !== null) {
    return baseValue + Math.random() * baseValue * 0.3 - baseValue * 0.15
  }
  
  if (metric.includes('Rate') || metric.includes('Conversion')) {
    return Math.random() * 10 + 1 // 1-11%
  }
  if (metric.includes('Cost') || metric.includes('Value') || metric.includes('Profit') || metric === 'Revenue') {
    return Math.random() * 50000 + 1000 // $1k-$51k
  }
  return Math.floor(Math.random() * 1000 + 10) // 10-1010
}

// Helper to generate chart data with multiple metrics
const generateChartData = (metrics, dimensions) => {
  return dimensions.values.map((dim) => {
    const dataPoint = { name: dim }
    metrics.forEach((metric) => {
      dataPoint[metric] = generateMetricValue(metric)
    })
    // Keep 'value' for backward compatibility (use first metric)
    dataPoint.value = dataPoint[metrics[0]]
    return dataPoint
  })
}

// Helper to generate table data with multiple metrics
const generateTableData = (metrics, dimensions) => {
  const headers = [dimensions.type.charAt(0).toUpperCase() + dimensions.type.slice(1), ...metrics]
  const rows = dimensions.values.map((dim) => {
    const row = [dim]
    metrics.forEach((metric) => {
      row.push(formatMetricValue(metric, generateMetricValue(metric)))
    })
    return row
  })
  return { headers, rows }
}

// Helper to generate title based on metrics and dimensions
const generateTitle = (metrics, dimensions) => {
  const dimensionLabel = dimensions.type.charAt(0).toUpperCase() + dimensions.type.slice(1)
  const metricsLabel = metrics.length === 1 
    ? metrics[0]
    : metrics.length === 2
    ? `${metrics[0]} and ${metrics[1]}`
    : `${metrics.slice(0, -1).join(', ')}, and ${metrics[metrics.length - 1]}`
  return `${metricsLabel} by ${dimensionLabel}`
}

// Migration function to update existing blocks to new data structure
const migrateBlocks = (blocks) => {
  return blocks.map((block) => {
    if (block.type === 'table') {
      // Update all table blocks to use new e-commerce data structure
      // Check if it needs migration (old structure or missing proper headers)
      const needsMigration = !block.data?.headers || 
        block.data.headers.length <= 1 ||
        block.data.headers.some(header => 
          header.includes('Column') || 
          header === 'Product' || 
          (header === 'Sales' && block.data.headers.length <= 3)
        )
      
      if (needsMigration) {
        // Generate new e-commerce data
        const numMetrics = Math.floor(Math.random() * 5) + 1
        const selectedMetrics = ecommerceMetrics
          .sort(() => Math.random() - 0.5)
          .slice(0, numMetrics)
        const dimensions = getRandomDimensions(5, 10)
        const tableData = generateTableData(selectedMetrics, dimensions)
        const title = block.title || generateTitle(selectedMetrics, dimensions)
        return { ...block, data: tableData, title }
      } else if (!block.title && block.data?.headers) {
        // Add title to existing blocks that have proper structure but no title
        const metrics = block.data.headers.slice(1) // Skip first column (dimension)
        const dimensionType = block.data.headers[0].toLowerCase()
        const dimensions = { type: dimensionType, values: block.data.rows.map(row => row[0]) }
        const title = generateTitle(metrics, dimensions)
        return { ...block, title }
      }
    } else if (block.type === 'chart') {
      // Update all chart blocks to use new e-commerce data structure
      // Check if it needs migration (old structure with just 'value' or missing metrics)
      const needsMigration = !block.metrics || 
        block.metrics.length === 0 ||
        (block.data?.length > 0 && 
         block.data[0].value !== undefined && 
         Object.keys(block.data[0]).filter(k => k !== 'name' && k !== 'value').length === 0)
      
      if (needsMigration) {
        // Generate new e-commerce data
        const numMetrics = Math.floor(Math.random() * 5) + 1
        const selectedMetrics = ecommerceMetrics
          .sort(() => Math.random() - 0.5)
          .slice(0, numMetrics)
        const dimensions = getRandomDimensions(5, 10)
        const chartData = generateChartData(selectedMetrics, dimensions)
        const title = block.title || generateTitle(selectedMetrics, dimensions)
        return { ...block, data: chartData, metrics: selectedMetrics, title }
      } else if (!block.title && block.metrics && block.data?.length > 0) {
        // Add title to existing blocks that have proper structure but no title
        const dimensionType = block.data[0].name ? 'time' : 'dimension'
        const dimensions = { type: dimensionType, values: block.data.map(d => d.name) }
        const title = generateTitle(block.metrics, dimensions)
        return { ...block, title }
      }
    }
    return block
  })
}

// Dummy data generator
const generateDummyData = () => {
  // Fixed dummy data with e-commerce metrics
  // Table with 3 metrics and 7 time dimensions
  const tableMetrics = ['Revenue', 'Sales', 'Orders']
  const tableDimensions = { type: 'time', values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] }
  const tableData = generateTableData(tableMetrics, tableDimensions)
  const tableTitle = generateTitle(tableMetrics, tableDimensions)

  // Chart 1: Line chart with 2 metrics and 6 time dimensions
  const chart1Metrics = ['Revenue', 'Sales']
  const chart1Dimensions = { type: 'time', values: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] }
  const chart1Data = generateChartData(chart1Metrics, chart1Dimensions)
  const chart1Title = generateTitle(chart1Metrics, chart1Dimensions)

  // Chart 2: Bar chart with 2 metrics and 5 region dimensions
  const chart2Metrics = ['Orders', 'Conversion Rate']
  const chart2Dimensions = { type: 'region', values: ['North', 'South', 'East', 'West', 'Central'] }
  const chart2Data = generateChartData(chart2Metrics, chart2Dimensions)
  const chart2Title = generateTitle(chart2Metrics, chart2Dimensions)

  return [
    {
      id: '1',
      type: 'text',
      content: 'Welcome to CL Blocks! Type "/" to add a new block.',
    },
    {
      id: '2',
      type: 'text',
      content: 'This is a Notion-style block editor with drag-and-drop support.',
    },
    {
      id: '3',
      type: 'table',
      data: tableData,
      title: tableTitle,
    },
    {
      id: '4',
      type: 'chart',
      chartType: 'line',
      data: chart1Data,
      metrics: chart1Metrics,
      title: chart1Title,
    },
    {
      id: '5',
      type: 'chart',
      chartType: 'bar',
      data: chart2Data,
      metrics: chart2Metrics,
      title: chart2Title,
    },
  ]
}

function App() {
  const { reportId: urlReportId } = useParams()
  const navigate = useNavigate()
  const [blocks, setBlocks] = useState([])
  const [reportTitle, setReportTitle] = useState('')
  const [focusedBlockId, setFocusedBlockId] = useState(null)
  const [commandMenuOpenIndex, setCommandMenuOpenIndex] = useState(null)
  const [openSidepanelBlockId, setOpenSidepanelBlockId] = useState(null)
  const [showAllMetrics, setShowAllMetrics] = useState(false)
  const [showAllDimensions, setShowAllDimensions] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatResponse, setChatResponse] = useState('')
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [tempBlock, setTempBlock] = useState(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [currentReportId, setCurrentReportId] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const [readOnlyModifiedBlocks, setReadOnlyModifiedBlocks] = useState(new Set())
  const [readOnlyOriginalBlocks, setReadOnlyOriginalBlocks] = useState(new Map())
  const [timePeriod, setTimePeriod] = useState('Last 4 weeks')
  const [selectedDimensions, setSelectedDimensions] = useState([])
  const [showSubheader, setShowSubheader] = useState(false)
  const [loading, setLoading] = useState(true)
  const filterBlockRef = useRef(null)
  const editorRef = useRef(null)
  const blockRefs = useRef({})
  const realtimeChannelRef = useRef(null)

  // Load report from URL
  useEffect(() => {
    let isMounted = true
    
    const loadReportData = async () => {
      setLoading(true)
      let reportId = urlReportId

      // If URL has "default", try to load from Supabase or localStorage
      if (reportId === 'default') {
        // Try to load existing reports from Supabase first
        const allReports = await loadAllReports()
        const firstReport = allReports.find(r => r.accessLevel === 'edit')
        
        if (firstReport) {
          reportId = firstReport.id
          if (isMounted) {
            navigate(`/reports/${reportId}`, { replace: true })
          }
          return
        }
        
        // Check localStorage as fallback
        const reportsData = localStorage.getItem('cl-blocks-reports')
        if (reportsData) {
          const reports = JSON.parse(reportsData)
          const firstLocalReport = Object.values(reports).find(r => r.accessLevel === 'edit')
          if (firstLocalReport) {
            reportId = firstLocalReport.id
            if (isMounted) {
              navigate(`/reports/${reportId}`, { replace: true })
            }
            return
          }
        }
        
        // If no reports found, create initial ones
        await initializeReports()
        reportId = 'my-reports-1'
        if (isMounted) {
          navigate(`/reports/${reportId}`, { replace: true })
        }
        return
      }

      // Load the report
      if (reportId && reportId !== 'default') {
        console.log('🔄 Attempting to load report:', reportId)
        const report = await loadReport(reportId)
        
        if (report && isMounted) {
          console.log('✅ Report loaded successfully:', reportId)
          const migratedBlocks = migrateBlocks(report.blocks)
          setBlocks(migratedBlocks)
          setReportTitle(report.title || '')
          setCurrentReportId(report.id)
          setIsReadOnly(report.accessLevel === 'read')
          setIsFavorite(report.favorite || false)
          setReadOnlyModifiedBlocks(new Set())
          setReadOnlyOriginalBlocks(new Map())
          setTimePeriod(report.filters?.timePeriod || 'Last 4 weeks')
          setSelectedDimensions(report.filters?.selectedDimensions || [])
          
          // Update last saved state to prevent immediate auto-save
          lastSavedRef.current = JSON.stringify({
            blocks: migratedBlocks,
            title: report.title || '',
            timePeriod: report.filters?.timePeriod || 'Last 4 weeks',
            selectedDimensions: report.filters?.selectedDimensions || [],
            favorite: report.favorite || false
          })
          
          // Set up real-time subscription
          if (realtimeChannelRef.current) {
            unsubscribeFromReport(realtimeChannelRef.current)
          }
          realtimeChannelRef.current = subscribeToReport(reportId, (updatedReport) => {
            // Only update if it's not our own change (prevent loops)
            if (updatedReport.id === reportId && isMounted) {
              const migratedBlocks = migrateBlocks(updatedReport.blocks)
              setBlocks(migratedBlocks)
              setReportTitle(updatedReport.title || '')
              setTimePeriod(updatedReport.filters?.timePeriod || 'Last 4 weeks')
              setSelectedDimensions(updatedReport.filters?.selectedDimensions || [])
              
              // Update last saved state when receiving real-time update
              lastSavedRef.current = JSON.stringify({
                blocks: migratedBlocks,
                title: updatedReport.title || '',
                timePeriod: updatedReport.filters?.timePeriod || 'Last 4 weeks',
                selectedDimensions: updatedReport.filters?.selectedDimensions || [],
                favorite: updatedReport.favorite || false
              })
            }
          })
        } else if (isMounted && reportId !== 'default') {
          // Report not found - try to load all reports to see what exists
          console.warn(`⚠️ Report ${reportId} not found, checking what reports exist...`)
          const allReports = await loadAllReports()
          console.log('📋 Available reports:', allReports.map(r => r.id))
          
          // Try to find the exact report in the list (maybe it exists but loadReport failed)
          const foundReport = allReports.find(r => r.id === reportId)
          if (foundReport) {
            console.log('✅ Found report in allReports list, using it directly:', reportId)
            const migratedBlocks = migrateBlocks(foundReport.blocks)
            setBlocks(migratedBlocks)
            setReportTitle(foundReport.title || '')
            setCurrentReportId(foundReport.id)
            setIsReadOnly(foundReport.accessLevel === 'read')
            setIsFavorite(foundReport.favorite || false)
            setReadOnlyModifiedBlocks(new Set())
            setReadOnlyOriginalBlocks(new Map())
            setTimePeriod(foundReport.filters?.timePeriod || 'Last 4 weeks')
            setSelectedDimensions(foundReport.filters?.selectedDimensions || [])
            
            // Update last saved state
            lastSavedRef.current = JSON.stringify({
              blocks: migratedBlocks,
              title: foundReport.title || '',
              timePeriod: foundReport.filters?.timePeriod || 'Last 4 weeks',
              selectedDimensions: foundReport.filters?.selectedDimensions || [],
              favorite: foundReport.favorite || false
            })
            
            // Set up real-time subscription
            if (realtimeChannelRef.current) {
              unsubscribeFromReport(realtimeChannelRef.current)
            }
            realtimeChannelRef.current = subscribeToReport(reportId, (updatedReport) => {
              if (updatedReport.id === reportId && isMounted) {
                const migratedBlocks = migrateBlocks(updatedReport.blocks)
                setBlocks(migratedBlocks)
                setReportTitle(updatedReport.title || '')
                setTimePeriod(updatedReport.filters?.timePeriod || 'Last 4 weeks')
                setSelectedDimensions(updatedReport.filters?.selectedDimensions || [])
                lastSavedRef.current = JSON.stringify({
                  blocks: migratedBlocks,
                  title: updatedReport.title || '',
                  timePeriod: updatedReport.filters?.timePeriod || 'Last 4 weeks',
                  selectedDimensions: updatedReport.filters?.selectedDimensions || [],
                  favorite: updatedReport.favorite || false
                })
              }
            })
          } else if (allReports.length > 0) {
            // Report doesn't exist, redirect to first available
            const firstReport = allReports[0]
            console.log('🔄 Redirecting to first available report:', firstReport.id)
            navigate(`/reports/${firstReport.id}`, { replace: true })
          } else {
            // No reports exist, initialize them
            console.log('🔄 No reports found, initializing...')
            await initializeReports()
            navigate(`/reports/my-reports-1`, { replace: true })
          }
        }
      }
      
      if (isMounted) {
        setLoading(false)
      }
    }

    loadReportData()

    // Cleanup
    return () => {
      isMounted = false
      if (realtimeChannelRef.current) {
        unsubscribeFromReport(realtimeChannelRef.current)
      }
    }
  }, [urlReportId, navigate])

  // Initialize reports if they don't exist
  const initializeReports = async () => {
    // Check if reports already exist in Supabase
    const existingReports = await loadAllReports()
    console.log('📋 Existing reports in database:', existingReports.length)
    if (existingReports.length > 0) {
      console.log('📋 Report IDs:', existingReports.map(r => ({ id: r.id, title: r.title })))
      return // Reports already exist, don't recreate
    }

    const currentDoc = loadFromStorage()
    let initialBlocks = []
    
    if (currentDoc) {
      if (Array.isArray(currentDoc)) {
        initialBlocks = migrateBlocks(currentDoc)
      } else if (currentDoc.blocks && Array.isArray(currentDoc.blocks)) {
        initialBlocks = migrateBlocks(currentDoc.blocks)
      }
    } else {
      initialBlocks = generateDummyData()
    }
    
    // Create 3 editable reports and 1 read-only report
    const reports = [
      {
        id: 'my-reports-1',
        title: '[Sample] OM Creative Performance review',
        blocks: initialBlocks,
        accessLevel: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        }
      },
      {
        id: 'my-reports-2',
        title: '[Sample] Q4 Marketing Performance',
        blocks: JSON.parse(JSON.stringify(initialBlocks)),
        accessLevel: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        }
      },
      {
        id: 'my-reports-3',
        title: '[Sample] Sales Dashboard 2024',
        blocks: JSON.parse(JSON.stringify(initialBlocks)),
        accessLevel: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        }
      },
      {
        id: 'shared-1',
        title: '[Sample] OM Creative Performance review',
        blocks: JSON.parse(JSON.stringify(initialBlocks)),
        accessLevel: 'read',
        category: 'shared-with-me',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        }
      }
    ]

    // Save all reports to Supabase
    for (const report of reports) {
      await saveReport(report)
      console.log(`Initialized report: ${report.id}`)
    }
  }

  // Track the last saved state to prevent unnecessary saves
  const lastSavedRef = useRef(null)

  // Auto-save (only if not read-only)
  useEffect(() => {
    if (isReadOnly || !currentReportId || loading) {
      console.log('⏭️ Skipping auto-save:', { isReadOnly, currentReportId, loading })
      return
    }
    
    // Create a snapshot of current state
    const currentState = JSON.stringify({
      blocks,
      title: reportTitle,
      timePeriod,
      selectedDimensions,
      favorite: isFavorite
    })
    
    // Skip if nothing changed
    if (lastSavedRef.current === currentState) {
      return
    }
    
    console.log('⏰ Auto-save scheduled for report:', currentReportId)
    
    const timeoutRef = setTimeout(async () => {
      try {
        // Determine category from current report or default
        const currentReport = await loadReport(currentReportId)
        const category = currentReport?.category || (isReadOnly ? 'shared-with-me' : 'my-reports')
        
        console.log('💾 Auto-saving report:', currentReportId)
        const result = await saveReport({
          id: currentReportId,
          title: reportTitle,
          blocks: blocks,
          accessLevel: isReadOnly ? 'read' : 'edit',
          category: category,
          filters: {
            timePeriod,
            selectedDimensions
          },
          favorite: isFavorite
        })
        
        if (result) {
          lastSavedRef.current = currentState
          console.log('✅ Auto-save completed')
        } else {
          console.warn('⚠️ Auto-save returned false')
        }
      } catch (error) {
        console.error('❌ Error auto-saving:', error)
      }
    }, 2000) // Increased to 2 seconds to reduce save frequency

    return () => clearTimeout(timeoutRef)
  }, [blocks, reportTitle, timePeriod, selectedDimensions, isReadOnly, currentReportId, isFavorite, loading])

  // Track when filter block scrolls under header
  useEffect(() => {
    if (!filterBlockRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When filter block is not intersecting (scrolled under header), show subheader
          setShowSubheader(!entry.isIntersecting)
        })
      },
      {
        root: null,
        rootMargin: '-64px 0px 0px 0px', // Header height is 64px (h-16)
        threshold: 0
      }
    )

    observer.observe(filterBlockRef.current)

    return () => {
      if (filterBlockRef.current) {
        observer.unobserve(filterBlockRef.current)
      }
    }
  }, [])

  // Load report function (for sidebar navigation)
  const loadReport = async (reportId) => {
    // Navigate to the report URL
    navigate(`/reports/${reportId}`)
  }

  // Toggle favorite status
  const handleToggleFavorite = async () => {
    if (!currentReportId) return
    
    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)
    
    await saveReport({
      id: currentReportId,
      title: reportTitle,
      blocks: blocks,
      accessLevel: isReadOnly ? 'read' : 'edit',
      category: 'my-reports',
      filters: {
        timePeriod,
        selectedDimensions
      },
      favorite: newFavoriteStatus
    })
    
    setSidebarRefreshKey(prev => prev + 1) // Trigger sidebar refresh
  }

  // Handle command menu

  const handleCommandSelect = (commandType, insertIndex) => {
    if (isReadOnly) return
    
    const newBlock = createBlock(commandType)

    setBlocks((prev) => {
      const newBlocks = [...prev]
      newBlocks.splice(insertIndex, 0, newBlock)
      return newBlocks
    })

    setCommandMenuOpenIndex(null)
    setFocusedBlockId(newBlock.id)
  }


  const createBlock = (type) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    switch (type) {
      case 'text':
        return { id, type: 'text', content: '' }
      case 'separator':
        return { id, type: 'separator' }
      case 'table': {
        // Random 1-5 metrics
        const numMetrics = Math.floor(Math.random() * 5) + 1
        const selectedMetrics = ecommerceMetrics
          .sort(() => Math.random() - 0.5)
          .slice(0, numMetrics)
        const dimensions = getRandomDimensions(5, 10)
        const tableData = generateTableData(selectedMetrics, dimensions)
        const title = generateTitle(selectedMetrics, dimensions)
        return {
          id,
          type: 'table',
          data: tableData,
          title,
        }
      }
      case 'chart': {
        // Random 1-5 metrics
        const numMetrics = Math.floor(Math.random() * 5) + 1
        const selectedMetrics = ecommerceMetrics
          .sort(() => Math.random() - 0.5)
          .slice(0, numMetrics)
        const dimensions = getRandomDimensions(5, 10)
        const chartData = generateChartData(selectedMetrics, dimensions)
        const title = generateTitle(selectedMetrics, dimensions)
        return {
          id,
          type: 'chart',
          chartType: 'line',
          data: chartData,
          metrics: selectedMetrics,
          title,
        }
      }
      default:
        return { id, type: 'text', content: '' }
    }
  }

  const handleBlockUpdate = (updatedBlock) => {
    // Allow updates in read-only mode (they won't be saved)
    if (isReadOnly) {
      // Find the original block to compare changes
      const originalBlock = blocks.find(b => b.id === updatedBlock.id)
      
      if (originalBlock) {
        // Check if block actually changed (compare JSON strings to detect any changes)
        const originalStr = JSON.stringify(originalBlock)
        const updatedStr = JSON.stringify(updatedBlock)
        const blockChanged = originalStr !== updatedStr
        
        if (blockChanged) {
          // Track that this block has been modified in read-only mode
          setReadOnlyModifiedBlocks((prev) => new Set([...prev, updatedBlock.id]))
          // Store the original block state if not already stored
          setReadOnlyOriginalBlocks((prev) => {
            if (!prev.has(updatedBlock.id)) {
              const newMap = new Map(prev)
              newMap.set(updatedBlock.id, JSON.parse(JSON.stringify(originalBlock)))
              return newMap
            }
            return prev
          })
        }
      }
      
      // Update local state so changes are visible
      setBlocks((prev) =>
        prev.map((block) => (block.id === updatedBlock.id ? updatedBlock : block))
      )
      return
    }
    setBlocks((prev) =>
      prev.map((block) => (block.id === updatedBlock.id ? updatedBlock : block))
    )
  }

  const handleBlockDelete = (blockId) => {
    if (isReadOnly) return
    setBlocks((prev) => prev.filter((block) => block.id !== blockId))
  }

  const handleInsertSeparator = (blockId) => {
    if (isReadOnly) return
    
    const currentIndex = blocks.findIndex(b => b.id === blockId)
    if (currentIndex === -1) return
    
    // Create separator block
    const separatorBlock = createBlock('separator')
    
    // Create new text block
    const newTextBlock = createBlock('text')
    
    setBlocks((prev) => {
      const newBlocks = [...prev]
      // Insert separator after current block
      newBlocks.splice(currentIndex + 1, 0, separatorBlock)
      // Insert new text block after separator
      newBlocks.splice(currentIndex + 2, 0, newTextBlock)
      return newBlocks
    })
    
    // Focus the new text block
    setFocusedBlockId(newTextBlock.id)
  }

  const handleResetBlock = (blockId) => {
    if (!isReadOnly) return
    const originalBlock = readOnlyOriginalBlocks.get(blockId)
    if (originalBlock) {
      // Restore the original block
      setBlocks((prev) =>
        prev.map((block) => (block.id === blockId ? originalBlock : block))
      )
      // Remove from modified blocks
      setReadOnlyModifiedBlocks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
      // Remove from original blocks map
      setReadOnlyOriginalBlocks((prev) => {
        const newMap = new Map(prev)
        newMap.delete(blockId)
        return newMap
      })
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination || isReadOnly) return

    const items = Array.from(blocks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setBlocks(items)
  }

  // Extract headings from blocks
  const extractHeadings = () => {
    const headings = []
    blocks.forEach((block, blockIndex) => {
      if (block.type === 'text' && block.content) {
        // Parse HTML content to find H1 and H2 elements
        const parser = new DOMParser()
        const doc = parser.parseFromString(block.content, 'text/html')
        const h1Elements = doc.querySelectorAll('h1')
        const h2Elements = doc.querySelectorAll('h2')
        
        h1Elements.forEach((h1) => {
          const text = h1.textContent.trim()
          if (text) {
            headings.push({
              level: 1,
              text,
              blockId: block.id,
              blockIndex,
            })
          }
        })
        
        h2Elements.forEach((h2) => {
          const text = h2.textContent.trim()
          if (text) {
            headings.push({
              level: 2,
              text,
              blockId: block.id,
              blockIndex,
            })
          }
        })
      }
    })
    return headings
  }

  const handleHeadingClick = (blockId) => {
    const blockElement = blockRefs.current[blockId]
    if (blockElement) {
      const yOffset = -80
      const y = blockElement.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const headings = extractHeadings()

  // Get the block for the open sidepanel (use tempBlock if there are unsaved changes)
  const sidepanelBlock = openSidepanelBlockId 
    ? (tempBlock || blocks.find(block => block.id === openSidepanelBlockId))
    : null

  // Reset temp block when sidepanel closes
  useEffect(() => {
    if (!openSidepanelBlockId) {
      setTempBlock(null)
      setUnsavedChanges(false)
      setChatInput('')
      setChatResponse('')
    }
  }, [openSidepanelBlockId])

  // Extract metrics and dimensions from the block
  let metrics = []
  let dimensions = []
  
  if (sidepanelBlock) {
    if (sidepanelBlock.type === 'chart') {
      // For charts: metrics from block.metrics, dimensions from data.name
      metrics = sidepanelBlock.metrics || []
      if (sidepanelBlock.data && sidepanelBlock.data.length > 0) {
        dimensions = sidepanelBlock.data.map(d => d.name).filter(Boolean)
      }
    } else if (sidepanelBlock.type === 'table') {
      // For tables: metrics from headers (skip first), dimensions from first column of rows
      if (sidepanelBlock.data?.headers) {
        metrics = sidepanelBlock.data.headers.slice(1)
      }
      if (sidepanelBlock.data?.rows) {
        dimensions = sidepanelBlock.data.rows.map(row => row[0]).filter(Boolean)
      }
    }
  }

  // Handle metric removal
  const handleRemoveMetric = (index) => {
    if (!sidepanelBlock) return
    
    let updatedBlock
    if (sidepanelBlock.type === 'chart') {
      const updatedMetrics = metrics.filter((_, i) => i !== index)
      updatedBlock = { ...sidepanelBlock, metrics: updatedMetrics }
    } else if (sidepanelBlock.type === 'table') {
      const updatedHeaders = sidepanelBlock.data.headers.filter((_, i) => i !== index + 1)
      updatedBlock = { 
        ...sidepanelBlock, 
        data: { ...sidepanelBlock.data, headers: updatedHeaders }
      }
    }
    if (updatedBlock) {
      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
      }
    }
  }

  // Handle dimension removal
  const handleRemoveDimension = (index) => {
    if (!sidepanelBlock) return
    
    let updatedBlock
    if (sidepanelBlock.type === 'chart') {
      const updatedData = sidepanelBlock.data.filter((_, i) => i !== index)
      updatedBlock = { ...sidepanelBlock, data: updatedData }
    } else if (sidepanelBlock.type === 'table') {
      const updatedRows = sidepanelBlock.data.rows.filter((_, i) => i !== index)
      updatedBlock = { 
        ...sidepanelBlock, 
        data: { ...sidepanelBlock.data, rows: updatedRows }
      }
    }
    if (updatedBlock) {
      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
      }
    }
  }

  // Handle adding a metric
  const handleAddMetric = () => {
    if (!sidepanelBlock) return
    
    // Get available metrics (all ecommerce metrics not already in use)
    const availableMetrics = ecommerceMetrics.filter(m => !metrics.includes(m))
    if (availableMetrics.length === 0) return
    
    const newMetric = availableMetrics[0] // Add first available metric
    
    let updatedBlock
    if (sidepanelBlock.type === 'chart') {
      updatedBlock = { ...sidepanelBlock, metrics: [...metrics, newMetric] }
    } else if (sidepanelBlock.type === 'table') {
      const updatedHeaders = [...sidepanelBlock.data.headers, newMetric]
      // Add empty value for new metric in all rows
      const updatedRows = sidepanelBlock.data.rows.map(row => [...row, '0'])
      updatedBlock = { 
        ...sidepanelBlock, 
        data: { ...sidepanelBlock.data, headers: updatedHeaders, rows: updatedRows }
      }
    }
    if (updatedBlock) {
      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
      }
    }
  }

  // Handle adding a dimension
  const handleAddDimension = () => {
    if (!sidepanelBlock) return
    
    // Get available dimension values (from all dimension types)
    const allDimensionValues = Object.values(dimensionTypes).flat()
    const availableDimensions = allDimensionValues.filter(d => !dimensions.includes(d))
    if (availableDimensions.length === 0) return
    
    const newDimension = availableDimensions[0] // Add first available dimension
    
    if (sidepanelBlock.type === 'chart') {
      // Create a new data point with default values for all metrics
      const newDataPoint = { name: newDimension }
      metrics.forEach(metric => {
        newDataPoint[metric] = 0
      })
      if (metrics.length === 0) {
        newDataPoint.value = 0
      }
      const updatedBlock = { ...sidepanelBlock, data: [...sidepanelBlock.data, newDataPoint] }
      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
      }
    } else if (sidepanelBlock.type === 'table') {
      // Add new row with dimension and default values for all metrics
      const newRow = [newDimension, ...metrics.map(() => '0')]
      const updatedBlock = { 
        ...sidepanelBlock, 
        data: { ...sidepanelBlock.data, rows: [...sidepanelBlock.data.rows, newRow] }
      }
      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
      }
    }
  }

  // Call AI API to extract metrics and dimensions from natural language
  const callAIAPI = async (query) => {
    try {
      // This is a placeholder - you'll need to configure your API endpoint and key
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a data analysis assistant. Extract metrics and dimensions from user queries about charts and tables. 
              Available metrics: ${ecommerceMetrics.join(', ')}. 
              Available dimension types: ${Object.keys(dimensionTypes).join(', ')}.
              Available dimension values: ${Object.values(dimensionTypes).flat().join(', ')}.
              Return a JSON object with "metrics" array and "dimensions" array. Only include metrics and dimensions that exist in the available lists.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error('API call failed')
      }

      const data = await response.json()
      const content = JSON.parse(data.choices[0].message.content)
      return content
    } catch (error) {
      console.error('AI API error:', error)
      // Fallback: try to extract metrics/dimensions using simple matching
      const extractedMetrics = ecommerceMetrics.filter(metric => 
        query.toLowerCase().includes(metric.toLowerCase())
      )
      const allDimensionValues = Object.values(dimensionTypes).flat()
      const extractedDimensions = allDimensionValues.filter(dim => 
        query.toLowerCase().includes(dim.toLowerCase())
      )
      return {
        metrics: extractedMetrics,
        dimensions: extractedDimensions
      }
    }
  }

  // Handle chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !sidepanelBlock || chatLoading) return

    setChatLoading(true)
    setChatResponse('')

    try {
      const result = await callAIAPI(chatInput)
      setChatResponse(result.metrics?.length > 0 || result.dimensions?.length > 0 
        ? 'Updated metrics and dimensions based on your query.' 
        : 'No matching metrics or dimensions found.')

      // Update block structure with extracted metrics and dimensions
      let updatedBlock = { ...sidepanelBlock }

      if (result.metrics && result.metrics.length > 0) {
        if (sidepanelBlock.type === 'chart') {
          updatedBlock = { ...updatedBlock, metrics: result.metrics }
        } else if (sidepanelBlock.type === 'table') {
          const dimensionHeader = sidepanelBlock.data.headers[0]
          updatedBlock = {
            ...updatedBlock,
            data: {
              ...sidepanelBlock.data,
              headers: [dimensionHeader, ...result.metrics]
            }
          }
        }
      }

      if (result.dimensions && result.dimensions.length > 0) {
        if (sidepanelBlock.type === 'chart') {
          // Keep existing data structure, just update dimension names
          const existingData = sidepanelBlock.data || []
          const updatedData = result.dimensions.map((dim, index) => {
            if (existingData[index]) {
              return { ...existingData[index], name: dim }
            }
            // Create new data point if needed
            const newPoint = { name: dim }
            const currentMetrics = result.metrics || metrics
            currentMetrics.forEach(metric => {
              newPoint[metric] = 0
            })
            if (currentMetrics.length === 0) {
              newPoint.value = 0
            }
            return newPoint
          })
          updatedBlock = { ...updatedBlock, data: updatedData }
        } else if (sidepanelBlock.type === 'table') {
          const existingRows = sidepanelBlock.data.rows || []
          const updatedRows = result.dimensions.map((dim, index) => {
            if (existingRows[index]) {
              return [dim, ...existingRows[index].slice(1)]
            }
            // Create new row if needed
            const currentMetrics = result.metrics || metrics
            return [dim, ...currentMetrics.map(() => '0')]
          })
          updatedBlock = {
            ...updatedBlock,
            data: {
              ...sidepanelBlock.data,
              rows: updatedRows
            }
          }
        }
      }

      if (isReadOnly) {
        handleBlockUpdate(updatedBlock)
        setChatInput('')
      } else {
        setTempBlock(updatedBlock)
        setUnsavedChanges(true)
        setChatInput('')
      }
    } catch (error) {
      setChatResponse('Error processing your query. Please try again.')
      console.error('Chat error:', error)
    } finally {
      setChatLoading(false)
    }
  }

  // Handle save button
  const handleSave = () => {
    if (tempBlock) {
      handleBlockUpdate(tempBlock)
      setTempBlock(null)
      setUnsavedChanges(false)
      setChatResponse('')
    }
  }

  // Apply filters to block data
  const applyFiltersToBlock = (block) => {
    if (!block || (block.type !== 'chart' && block.type !== 'table')) {
      return block
    }

    const filteredBlock = { ...block }

    if (block.type === 'chart') {
      let filteredData = [...(block.data || [])]
      
      // Apply time period filter (filter by dimension name if it matches time periods)
      if (timePeriod && timePeriod !== 'Last 4 weeks') {
        // For now, placeholder - will implement actual filtering logic later
        // This is where we'd filter based on the selected time period
      }
      
      // Apply dimension filter
      if (selectedDimensions.length > 0) {
        filteredData = filteredData.filter(item => 
          selectedDimensions.includes(item.name)
        )
      }
      
      filteredBlock.data = filteredData
    } else if (block.type === 'table') {
      let filteredRows = [...(block.data?.rows || [])]
      
      // Apply time period filter
      if (timePeriod && timePeriod !== 'Last 4 weeks') {
        // For now, placeholder - will implement actual filtering logic later
      }
      
      // Apply dimension filter
      if (selectedDimensions.length > 0) {
        filteredRows = filteredRows.filter(row => 
          selectedDimensions.includes(row[0])
        )
      }
      
      filteredBlock.data = {
        ...block.data,
        rows: filteredRows
      }
    }

    return filteredBlock
  }

  // Handle filter updates
  const handleTimePeriodChange = (newTimePeriod) => {
    setTimePeriod(newTimePeriod)
    // Auto-save will handle persistence
  }

  const handleDimensionsChange = (newDimensions) => {
    setSelectedDimensions(newDimensions)
    // Auto-save will handle persistence
  }

  const handleResetFilters = () => {
    setTimePeriod('Last 4 weeks')
    setSelectedDimensions([])
    // Auto-save will handle persistence
  }

  // Manual save function for testing
  const handleManualSave = async () => {
    if (!currentReportId || isReadOnly) return
    
    try {
      const currentReport = await loadReport(currentReportId)
      const category = currentReport?.category || (isReadOnly ? 'shared-with-me' : 'my-reports')
      
      toast.info('Saving...', { duration: 1000 })
      const result = await saveReport({
        id: currentReportId,
        title: reportTitle,
        blocks: blocks,
        accessLevel: isReadOnly ? 'read' : 'edit',
        category: category,
        filters: {
          timePeriod,
          selectedDimensions
        },
        favorite: isFavorite
      })
      
      if (result) {
        // Update last saved state
        lastSavedRef.current = JSON.stringify({
          blocks,
          title: reportTitle,
          timePeriod,
          selectedDimensions,
          favorite: isFavorite
        })
        toast.success('Saved successfully!', { duration: 2000 })
      } else {
        toast.error('Failed to save')
      }
    } catch (error) {
      console.error('Manual save error:', error)
      toast.error('Error saving: ' + error.message)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar key={sidebarRefreshKey} onReportSelect={loadReport} currentReportId={currentReportId} />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar key={sidebarRefreshKey} onReportSelect={loadReport} currentReportId={currentReportId} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background md:rounded-t-xl">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-1.5 text-sm flex-1">
            <a
              href="#"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              My Reports
            </a>
            <ChevronRight className="h-4 w-4 text-sidebar-foreground/40" />
            <span className="font-medium text-sidebar-foreground">{reportTitle || 'New report'}</span>
            {isReadOnly && (
              <Badge variant="secondary" className="font-medium text-gray-600">
                <Eye className="h-3 w-3 mr-1" />
                View only
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2.5"
                onClick={handleManualSave}
                title="Manual save (for testing)"
              >
                <Loader2 className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2.5"
              onClick={() => {
                if (currentReportId) {
                  const shareUrl = `${window.location.origin}/reports/${currentReportId}`
                  navigator.clipboard.writeText(shareUrl).then(() => {
                    toast.success('Link copied to clipboard!', {
                      description: shareUrl
                    })
                  }).catch(() => {
                    toast.error('Failed to copy link')
                  })
                }
              }}
            >
              {isReadOnly ? (
                <>
                  <Building className="h-4 w-4" />
                  Share
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <div className="flex items-center gap-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleToggleFavorite}
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="sticky top-16 z-10 h-auto overflow-hidden">
          <div className={`flex shrink-0 items-center gap-2 border-b py-2 bg-background transform transition-transform duration-300 ${showSubheader ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="w-full flex items-center gap-2 px-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  Time period
                  {timePeriod && (
                    <span className="text-muted-foreground">: {timePeriod}</span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {['Last 7 days', 'Last 2 weeks', 'Last 4 weeks', 'Last 8 weeks', 'Last 12 weeks', 'Last 6 months', 'Last year', 'Custom range'].map((period) => (
                    <button
                      key={period}
                      onClick={() => handleTimePeriodChange(period)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors ${
                        timePeriod === period ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  Dimensions
                  {selectedDimensions.length > 0 && (
                    <span className="text-muted-foreground">: {selectedDimensions.length} selected</span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {Object.values(dimensionTypes).flat().map((dimension) => {
                    const isSelected = selectedDimensions.includes(dimension)
                    return (
                      <button
                        key={dimension}
                        onClick={() => {
                          if (isSelected) {
                            handleDimensionsChange(selectedDimensions.filter(d => d !== dimension))
                          } else {
                            handleDimensionsChange([...selectedDimensions, dimension])
                          }
                        }}
                        className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                          isSelected ? 'bg-accent font-medium' : ''
                        }`}
                      >
                        <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-input'
                        }`}>
                          {isSelected && (
                            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {dimension}
                      </button>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {(timePeriod !== 'Last 4 weeks' || selectedDimensions.length > 0) && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset
              </button>
            )}
            </div>
          </div>
        </div>
        <div className="relative flex flex-1 flex-col">
          <div className={`flex flex-1 flex-col gap-4 p-4 pt-6 transition-all duration-300 ease-in-out ${openSidepanelBlockId ? 'mr-[400px]' : ''}`}>
            <div className="max-w-4xl mx-auto w-full px-6">
            <div className="relative mt-10 mb-10 flex items-center gap-3">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => !isReadOnly && setReportTitle(e.target.value)}
                placeholder="New report"
                disabled={isReadOnly}
                className="w-full text-4xl font-bold outline-none bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 disabled:cursor-default"
              />
            </div>
            {headings.length > 0 && (
              <div className="relative mb-10">
                <div className="border-l-2 border-gray-200 pl-4">
                  <div className="space-y-1">
                    {headings.map((heading, index) => (
                      <button
                        key={index}
                        onClick={() => handleHeadingClick(heading.blockId)}
                        className={`block text-left hover:text-foreground transition-colors ${
                          heading.level === 1
                            ? 'text-base font-semibold'
                            : 'text-sm text-muted-foreground ml-4'
                        }`}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Filter Block */}
            <div ref={filterBlockRef} className="border rounded-lg ml-0 mr-0 px-[12px] mb-6 flex items-center gap-2 py-2 relative overflow-visible">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                      Time period
                      {timePeriod && (
                        <span className="text-muted-foreground">: {timePeriod}</span>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1">
                      {['Last 7 days', 'Last 2 weeks', 'Last 4 weeks', 'Last 8 weeks', 'Last 12 weeks', 'Last 6 months', 'Last year', 'Custom range'].map((period) => (
                        <button
                          key={period}
                          onClick={() => handleTimePeriodChange(period)}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors ${
                            timePeriod === period ? 'bg-accent font-medium' : ''
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-2">
                      Dimensions
                      {selectedDimensions.length > 0 && (
                        <span className="text-muted-foreground">: {selectedDimensions.length} selected</span>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {Object.values(dimensionTypes).flat().map((dimension) => {
                        const isSelected = selectedDimensions.includes(dimension)
                        return (
                          <button
                            key={dimension}
                            onClick={() => {
                              if (isSelected) {
                                handleDimensionsChange(selectedDimensions.filter(d => d !== dimension))
                              } else {
                                handleDimensionsChange([...selectedDimensions, dimension])
                              }
                            }}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                              isSelected ? 'bg-accent font-medium' : ''
                            }`}
                          >
                            <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                              isSelected ? 'bg-primary border-primary' : 'border-input'
                            }`}>
                              {isSelected && (
                                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {dimension}
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                {(timePeriod !== 'Last 4 weeks' || selectedDimensions.length > 0) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="blocks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="relative pl-0">
                    {blocks.map((block, index) => {
                      const filteredBlock = applyFiltersToBlock(block)
                      return (
                        <React.Fragment key={block.id}>
                          <div className="group/block-wrapper">
                            <div 
                              className="relative group/block"
                              ref={(el) => {
                                if (el) {
                                  blockRefs.current[block.id] = el
                                }
                              }}
                            >
                              <Block
                                block={filteredBlock}
                                index={index}
                                onUpdate={handleBlockUpdate}
                                onDelete={() => handleBlockDelete(block.id)}
                                isFocused={focusedBlockId === block.id}
                                onFocus={() => setFocusedBlockId(block.id)}
                                onScrollToBlock={handleHeadingClick}
                                onOpenSidepanel={() => setOpenSidepanelBlockId(block.id)}
                                openSidepanelBlockId={openSidepanelBlockId}
                                isReadOnly={isReadOnly}
                                isReadOnlyModified={readOnlyModifiedBlocks.has(block.id)}
                                onReset={() => handleResetBlock(block.id)}
                                onInsertSeparator={handleInsertSeparator}
                                onOpenCommandMenu={() => setCommandMenuOpenIndex(index + 1)}
                              />
                            </div>
                          </div>
                          {index < blocks.length - 1 && (
                            <div className="relative group/line">
                              {!isReadOnly ? (
                                <div className="relative">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 group/add-button">
                                    <div className={`transition-opacity ${
                                      commandMenuOpenIndex === index + 1 
                                        ? 'opacity-100' 
                                        : 'opacity-0 group-hover/line:opacity-100 group-hover/add-button:opacity-100'
                                    } ${commandMenuOpenIndex === index + 1 ? 'pointer-events-auto' : 'pointer-events-none group-hover/line:pointer-events-auto group-hover/add-button:pointer-events-auto'}`}>
                                      <CommandMenu
                                        open={commandMenuOpenIndex === index + 1}
                                        onOpenChange={(open) => {
                                          setCommandMenuOpenIndex(open ? index + 1 : null)
                                        }}
                                        onSelect={(commandType) => handleCommandSelect(commandType, index + 1)}
                                        trigger={
                                          <AddBlockButton
                                            isOpen={commandMenuOpenIndex === index + 1}
                                          />
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className={`py-3 transition-opacity ${
                                    commandMenuOpenIndex === index + 1 
                                      ? 'opacity-100' 
                                      : 'opacity-0 group-hover/line:opacity-100 hover:opacity-100'
                                  }`}>
                                    <div className={`h-0.5 transition-colors ${
                                      commandMenuOpenIndex === index + 1
                                        ? 'bg-blue-500'
                                        : 'bg-gray-200'
                                    }`} />
                                  </div>
                                </div>
                              ) : (
                                <div className="py-3">
                                  <div className="h-0.5 bg-transparent" />
                                </div>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      )
                    })}
                    {blocks.length > 0 && (
                      <div className="relative group/line mb-[50vh]">
                        {!isReadOnly ? (
                          <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 group/add-button">
                              <div className={`transition-opacity ${
                                commandMenuOpenIndex === blocks.length 
                                  ? 'opacity-100' 
                                  : 'opacity-0 group-hover/line:opacity-100 group-hover/add-button:opacity-100'
                              } ${commandMenuOpenIndex === blocks.length ? 'pointer-events-auto' : 'pointer-events-none group-hover/line:pointer-events-auto group-hover/add-button:pointer-events-auto'}`}>
                                <CommandMenu
                                  open={commandMenuOpenIndex === blocks.length}
                                  onOpenChange={(open) => {
                                    setCommandMenuOpenIndex(open ? blocks.length : null)
                                  }}
                                  onSelect={(commandType) => handleCommandSelect(commandType, blocks.length)}
                                  trigger={
                                    <AddBlockButton
                                      isOpen={commandMenuOpenIndex === blocks.length}
                                    />
                                  }
                                />
                              </div>
                            </div>
                            <div className={`py-3 transition-opacity ${
                              commandMenuOpenIndex === blocks.length 
                                ? 'opacity-100' 
                                : 'opacity-0 group-hover/line:opacity-100 hover:opacity-100'
                            }`}>
                              <div className={`h-0.5 transition-colors ${
                                commandMenuOpenIndex === blocks.length
                                  ? 'bg-blue-500'
                                  : 'bg-gray-200'
                              }`} />
                            </div>
                          </div>
                        ) : (
                          <div className="py-3">
                            <div className="h-0.5 bg-transparent" />
                          </div>
                        )}
                      </div>
                    )}
                    {blocks.length === 0 && (
                      !isReadOnly ? (
                        <div className="relative group/block min-h-[2rem] w-full border border-dashed border-gray-200 rounded-lg mt-10 mb-[50vh] hover:border hover:border-solid hover:border-gray-100 hover:bg-accent transition-all">
                          <div className="flex gap-2 p-4">
                            <Button
                              onClick={() => handleCommandSelect('text', blocks.length)}
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Text
                            </Button>
                            <Button
                              onClick={() => handleCommandSelect('chart', blocks.length)}
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Metric
                            </Button>
                            <Button
                              onClick={() => handleCommandSelect('table', blocks.length)}
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Table
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group/block min-h-[2rem] w-full border border-dashed border-gray-200 rounded-lg mt-10 mb-[50vh]"></div>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

          </div>
          </div>
          <div className={`fixed right-0 top-[72px] bottom-0 w-[400px] bg-background border-l z-20 transform transition-transform duration-300 ease-in-out flex flex-col ${openSidepanelBlockId ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 px-6 pt-6">
                <h2 className="text-lg font-semibold">Analyse</h2>
                <div className="flex items-center gap-2">
                  {unsavedChanges && !isReadOnly && (
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="h-8 text-xs"
                    >
                      Save
                    </Button>
                  )}
                  <button
                    onClick={() => setOpenSidepanelBlockId(null)}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="px-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Metrics / KPI</h3>
                    <button
                      onClick={handleAddMetric}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                  {metrics.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-1 mt-2">
                        {(showAllMetrics ? metrics : metrics.slice(0, 3)).map((metric, displayIndex) => {
                          const actualIndex = metrics.indexOf(metric)
                          return (
                            <div key={actualIndex} className="flex items-center justify-between text-sm text-foreground bg-muted/50 rounded px-2 py-1.5">
                              <span>{metric}</span>
                              <button
                                onClick={() => handleRemoveMetric(actualIndex)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      {metrics.length > 3 && (
                        <button
                          onClick={() => setShowAllMetrics(!showAllMetrics)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                        >
                          {showAllMetrics ? 'Show less' : `Show more (${metrics.length - 3} more)`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2">No metrics</div>
                  )}
                </div>
                <div className="border-t my-6"></div>
                <div className="px-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Dimensions</h3>
                    <button
                      onClick={handleAddDimension}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                  {dimensions.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-1 mt-2">
                        {(showAllDimensions ? dimensions : dimensions.slice(0, 3)).map((dimension, displayIndex) => {
                          const actualIndex = dimensions.indexOf(dimension)
                          return (
                            <div key={actualIndex} className="flex items-center justify-between text-sm text-foreground bg-muted/50 rounded px-2 py-1.5">
                              <span>{dimension}</span>
                              <button
                                onClick={() => handleRemoveDimension(actualIndex)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      {dimensions.length > 3 && (
                        <button
                          onClick={() => setShowAllDimensions(!showAllDimensions)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                        >
                          {showAllDimensions ? 'Show less' : `Show more (${dimensions.length - 3} more)`}
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2">No dimensions</div>
                  )}
                </div>
                <div className="border-t my-6"></div>
                <div className="px-6">
                  <h3 className="text-sm font-semibold mb-2">Filters</h3>
                </div>
                <div className="border-t my-6"></div>
                <div className="px-6">
                  <h3 className="text-sm font-semibold mb-2">Breakdown</h3>
                </div>
                <div className="border-t my-6"></div>
              </div>
            </div>
            {/* Chat input fixed at bottom */}
            <div className="border-t p-4 bg-background">
              {chatResponse && (
                <div className="mb-2 text-xs text-muted-foreground">
                  {chatResponse}
                </div>
              )}
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Just ask..."
                  className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={chatLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={chatLoading || !chatInput.trim()}
                  className="h-10 px-3"
                >
                  {chatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default App

