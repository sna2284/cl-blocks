import { useState, useEffect, useRef } from 'react'
import { FileText, Table, BarChart3, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

const COMMANDS = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'table', label: 'Table', icon: Table },
  { id: 'chart', label: 'Chart', icon: BarChart3 },
]

const COMPANY_KPIS = [
  'Monthly Recurring Revenue (MRR)',
  'Customer Acquisition Cost (CAC)',
  'Customer Lifetime Value (LTV)',
  'Churn Rate',
  'Net Promoter Score (NPS)',
  'Gross Margin',
  'Operating Margin',
  'Return on Investment (ROI)',
  'Conversion Rate',
  'Average Revenue Per User (ARPU)',
  'Daily Active Users (DAU)',
  'Monthly Active Users (MAU)',
  'Customer Retention Rate',
  'Revenue Growth Rate',
  'Burn Rate',
  'Runway',
  'Lead Velocity Rate',
  'Sales Cycle Length',
  'Customer Satisfaction Score (CSAT)',
  'Time to Value',
]

const COMPANY_METRICS = [
  'Total Revenue',
  'Revenue Growth',
  'Cost of Goods Sold (COGS)',
  'Operating Expenses',
  'Net Profit',
  'Gross Profit',
  'EBITDA',
  'Cash Flow',
  'Accounts Receivable',
  'Accounts Payable',
  'Inventory Turnover',
  'Working Capital',
  'Debt-to-Equity Ratio',
  'Current Ratio',
  'Quick Ratio',
  'Return on Assets (ROA)',
  'Return on Equity (ROE)',
  'Earnings Per Share (EPS)',
  'Price-to-Earnings Ratio (P/E)',
  'Market Capitalization',
]

export default function CommandMenu({ onSelect, open, onOpenChange, trigger }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllKPIs, setShowAllKPIs] = useState(false)
  const [showAllMetrics, setShowAllMetrics] = useState(false)
  const inputRef = useRef(null)

  // Filter commands based on search query
  const filteredCommands = COMMANDS.filter(command =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter KPIs based on search query
  const filteredKPIs = COMPANY_KPIS.filter(kpi =>
    kpi.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter metrics based on search query
  const filteredMetrics = COMPANY_METRICS.filter(metric =>
    metric.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Maintain focus on input when menu opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Use requestAnimationFrame for better reliability
      const frameId = requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 10)
      })
      return () => cancelAnimationFrame(frameId)
    }
  }, [open])

  // Reset search and show more states when menu closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setShowAllKPIs(false)
      setShowAllMetrics(false)
    }
  }, [open])

  // Disable body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[320px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="px-0 py-0 border-b" onPointerDown={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onOpenChange(false)
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {/* Blocks Section */}
          {(!searchQuery || filteredCommands.length > 0) && (
            <>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
                Blocks
              </DropdownMenuLabel>
              {filteredCommands.map((command) => (
                <DropdownMenuItem
                  key={command.id}
                  onSelect={() => {
                    onSelect(command.id)
                    onOpenChange(false)
                  }}
                  className="cursor-pointer"
                >
                  <command.icon size={18} className="mr-2" />
                  <span>{command.label}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Divider between Blocks and Company KPIs */}
          {((!searchQuery || filteredCommands.length > 0) && (!searchQuery || filteredKPIs.length > 0)) && (
            <div className="border-t my-1" />
          )}

          {/* Company KPIs Section */}
          {(!searchQuery || filteredKPIs.length > 0) && (
            <>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
                Company KPIs
              </DropdownMenuLabel>
              {(showAllKPIs ? filteredKPIs : filteredKPIs.slice(0, 10)).map((kpi) => (
                <DropdownMenuItem
                  key={kpi}
                  onSelect={() => {
                    onSelect('text')
                    onOpenChange(false)
                  }}
                  className="cursor-pointer"
                >
                  <span>{kpi}</span>
                </DropdownMenuItem>
              ))}
              {filteredKPIs.length > 10 && (
                <div className="px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowAllKPIs(!showAllKPIs)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                  >
                    {showAllKPIs ? 'Show less' : `Show more (${filteredKPIs.length - 10} more)`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Divider between Company KPIs and Company Metrics */}
          {((!searchQuery || filteredKPIs.length > 0) && (!searchQuery || filteredMetrics.length > 0)) && (
            <div className="border-t my-1" />
          )}

          {/* Company Metrics Section */}
          {(!searchQuery || filteredMetrics.length > 0) && (
            <>
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
                All metrics
              </DropdownMenuLabel>
              {(showAllMetrics ? filteredMetrics : filteredMetrics.slice(0, 10)).map((metric) => (
                <DropdownMenuItem
                  key={metric}
                  onSelect={() => {
                    onSelect('text')
                    onOpenChange(false)
                  }}
                  className="cursor-pointer"
                >
                  <span>{metric}</span>
                </DropdownMenuItem>
              ))}
              {filteredMetrics.length > 10 && (
                <div className="px-2 py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowAllMetrics(!showAllMetrics)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                  >
                    {showAllMetrics ? 'Show less' : `Show more (${filteredMetrics.length - 10} more)`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* No results message */}
          {searchQuery && filteredCommands.length === 0 && filteredKPIs.length === 0 && filteredMetrics.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
