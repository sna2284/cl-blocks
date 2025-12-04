import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import {
  FileText,
  BarChart3,
  ChevronRight,
  Star,
  Folder,
  Users,
  Clock,
  Globe,
  Settings,
  HelpCircle,
  PieChart,
  Moon,
  Sun,
} from "lucide-react"
import { loadAllReports } from "../lib/reports"

// Fixed random report names (consistent across sessions)
const FIXED_MY_REPORTS = [
  'Q4 Marketing Performance',
  'Sales Dashboard 2024',
  'Customer Acquisition Analysis',
  'Revenue Growth Report',
  'Product Performance Review'
]

const FIXED_SHARED_REPORTS = [
  'Monthly Business Metrics',
  'Team Productivity Insights',
  'Financial Summary Report',
  'User Engagement Analytics',
  'Conversion Funnel Analysis'
]

const getReportsData = async (onReportSelect, currentReportId) => {
  const allReports = await loadAllReports()
  
  let myReports = allReports
    .filter(r => r.category === 'my-reports')
    .map(r => ({ title: r.title || 'New report', reportId: r.id, onSelect: () => onReportSelect(r.id) }))
  
  let sharedReports = allReports
    .filter(r => r.category === 'shared-with-me')
    .map(r => ({ title: r.title || 'New report', reportId: r.id, onSelect: () => onReportSelect(r.id) }))
  
  let favoriteReports = allReports
    .filter(r => r.favorite === true)
    .map(r => ({ title: r.title || 'New report', reportId: r.id, onSelect: () => onReportSelect(r.id) }))
  
  // Add 5 fixed reports to each section
  myReports = [
    ...myReports,
    ...FIXED_MY_REPORTS.map((title, idx) => ({ 
      title, 
      reportId: `random-my-${idx}`, 
      onSelect: () => {} 
    }))
  ]
  
  sharedReports = [
    ...sharedReports,
    ...FIXED_SHARED_REPORTS.map((title, idx) => ({ 
      title, 
      reportId: `random-shared-${idx}`, 
      onSelect: () => {} 
    }))
  ]
  
  return {
    navMain: [
      {
        title: "Reports",
        items: [
          {
            title: "Favourites",
            url: "#",
            icon: Star,
            subItems: favoriteReports,
          },
          {
            title: "My reports",
            url: "#",
            icon: Folder,
            subItems: myReports,
          },
          {
            title: "Shared with me",
            url: "#",
            icon: Users,
            subItems: sharedReports,
          },
          {
            title: "Recently opened",
            url: "#",
            icon: Clock,
            subItems: [],
          },
        ],
      },
      {
        title: "Metrics",
        items: [
          {
            title: "Global",
            url: "#",
            icon: Globe,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 1",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 2",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 3",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: Settings,
      },
      {
        title: "Help & Support",
        url: "#",
        icon: HelpCircle,
      },
    ],
  }
}

export function AppSidebar({ onReportSelect, currentReportId }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  const [reportsData, setReportsData] = useState({
    navMain: [
      {
        title: "Reports",
        items: [
          {
            title: "Favourites",
            url: "#",
            icon: Star,
            subItems: [],
          },
          {
            title: "My reports",
            url: "#",
            icon: Folder,
            subItems: [],
          },
          {
            title: "Shared with me",
            url: "#",
            icon: Users,
            subItems: [],
          },
          {
            title: "Recently opened",
            url: "#",
            icon: Clock,
            subItems: [],
          },
        ],
      },
      {
        title: "Metrics",
        items: [
          {
            title: "Global",
            url: "#",
            icon: Globe,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 1",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 2",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
          {
            title: "Team name 3",
            url: "#",
            icon: BarChart3,
            subItems: [
              { title: "Metric 1", url: "#" },
              { title: "Metric 2", url: "#" },
              { title: "Metric 3", url: "#" },
              { title: "Metric 4", url: "#" },
              { title: "Metric 5", url: "#" },
            ],
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: Settings,
      },
      {
        title: "Help & Support",
        url: "#",
        icon: HelpCircle,
      },
    ],
  })

  // Load sidebar open state from localStorage
  const [openSections, setOpenSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cl-blocks-sidebar-open-sections')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return {}
        }
      }
    }
    return {}
  })

  // Load reports data
  useEffect(() => {
    const loadData = async () => {
      const data = await getReportsData(onReportSelect || (() => {}), currentReportId)
      setReportsData(data)
    }
    loadData()
  }, [onReportSelect, currentReportId])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Save sidebar open state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cl-blocks-sidebar-open-sections', JSON.stringify(openSections))
  }, [openSections])

  const handleSectionToggle = (sectionTitle, isOpen) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionTitle]: isOpen
    }))
  }

  const data = reportsData

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <PieChart className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Acme Corp</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              by Clarisights
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1 -mx-2">
          {data.navMain.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isOpen = openSections[item.title] !== undefined 
                      ? openSections[item.title] 
                      : item.isActive || false
                    return (
                    <Collapsible
                      key={item.title}
                      asChild
                      open={isOpen}
                      onOpenChange={(open) => handleSectionToggle(item.title, open)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <SidebarMenuSub>
                            {item.subItems?.slice(0, 5).map((subItem, idx) => {
                              const isActive = currentReportId === subItem.reportId
                              return (
                                <SidebarMenuSubItem key={idx} className="opacity-0 -translate-x-2 group-data-[state=open]/collapsible:opacity-100 group-data-[state=open]/collapsible:translate-x-0 transition-all duration-300 ease-out" style={{ transitionDelay: `calc(${idx} * 40ms)` }}>
                                  <SidebarMenuSubButton asChild data-active={isActive}>
                                    {subItem.onSelect ? (
                                      <button onClick={subItem.onSelect} className={`min-w-0 ${isActive ? 'font-semibold' : ''}`}>
                                        <span className="truncate">{subItem.title}</span>
                                      </button>
                                    ) : (
                                      <a href={subItem.url || "#"} className={`min-w-0 ${isActive ? 'font-semibold' : ''}`}>
                                        <span className="truncate">{subItem.title}</span>
                                      </a>
                                    )}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                            {item.subItems && item.subItems.length > 0 && (
                              <SidebarMenuSubItem className="opacity-0 -translate-x-2 group-data-[state=open]/collapsible:opacity-100 group-data-[state=open]/collapsible:translate-x-0 transition-all duration-300 ease-out" style={{ transitionDelay: `calc(5 * 40ms)` }}>
                                <SidebarMenuSubButton asChild>
                                  <a href={item.url || "#"}>
                                    <span>See more</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
        <SidebarGroup className="border-t">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full px-2 py-1.5">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="h-4 w-4 text-sidebar-foreground/70" />
                ) : (
                  <Sun className="h-4 w-4 text-sidebar-foreground/70" />
                )}
                <span className="text-sm text-sidebar-foreground/70">Dark mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

