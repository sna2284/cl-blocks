import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Generate a unique report ID
 */
export const generateReportId = () => {
  return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Load a report from Supabase or localStorage fallback
 */
export const loadReport = async (reportId) => {
  console.log('📖 Loading report:', reportId)
  
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      console.log('🔍 Searching Supabase for report:', reportId)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 = not found - this is expected for new reports
          console.log('📭 Report not found in Supabase:', reportId)
        } else {
          console.error('❌ Error loading report from Supabase:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
      } else if (data) {
        console.log('✅ Found report in Supabase:', reportId)
        return {
          id: data.id,
          title: data.title || '',
          blocks: data.blocks || [],
          accessLevel: data.access_level || 'edit',
          category: data.category || 'my-reports',
          filters: data.filters || {
            timePeriod: 'Last 4 weeks',
            selectedDimensions: []
          },
          favorite: data.favorite || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      }
    } catch (err) {
      console.error('❌ Exception loading report:', err)
    }
  }

  // Fallback to localStorage
  console.log('🔍 Checking localStorage for report:', reportId)
  const reportsData = localStorage.getItem('cl-blocks-reports')
  if (reportsData) {
    const reports = JSON.parse(reportsData)
    const report = reports[reportId]
    if (report) {
      console.log('✅ Found report in localStorage:', reportId)
      return report
    }
  }

  console.log('❌ Report not found anywhere:', reportId)
  return null
}

/**
 * Save a report to Supabase or localStorage fallback
 */
export const saveReport = async (report) => {
  const reportData = {
    id: report.id,
    title: report.title || '',
    blocks: report.blocks || [],
    access_level: report.accessLevel || 'edit',
    category: report.category || 'my-reports',
    filters: report.filters || {
      timePeriod: 'Last 4 weeks',
      selectedDimensions: []
    },
    favorite: report.favorite || false
  }

  console.log('💾 Saving report:', report.id, 'to Supabase...')

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .upsert(reportData, {
          onConflict: 'id'
        })
        .select()

      if (error) {
        console.error('❌ Error saving report to Supabase:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        // Fall through to localStorage
      } else {
        console.log('✅ Successfully saved report to Supabase:', report.id)
        if (data && data.length > 0) {
          console.log('Saved data:', data[0])
        }
        return true
      }
    } catch (err) {
      console.error('❌ Exception saving report:', err)
      console.error('Exception details:', err.message, err.stack)
      // Fall through to localStorage
    }
  } else {
    console.warn('⚠️ Supabase not configured, using localStorage fallback')
  }

  // Fallback to localStorage
  console.log('💾 Saving to localStorage fallback...')
  const reportsData = localStorage.getItem('cl-blocks-reports')
  const reports = reportsData ? JSON.parse(reportsData) : {}
  reports[report.id] = {
    id: report.id,
    title: report.title,
    blocks: report.blocks,
    accessLevel: report.accessLevel,
    category: report.category,
    filters: report.filters,
    favorite: report.favorite
  }
  localStorage.setItem('cl-blocks-reports', JSON.stringify(reports))
  console.log('✅ Saved to localStorage')
  return true
}

/**
 * Load all reports (for sidebar)
 */
export const loadAllReports = async () => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      console.log('📋 Loading all reports from Supabase...')
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading reports from Supabase:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } else if (data) {
        console.log('✅ Loaded', data.length, 'reports from Supabase')
        console.log('📋 Report data:', data.map(r => ({ id: r.id, title: r.title, hasBlocks: !!r.blocks })))
        return data.map(report => ({
          id: report.id,
          title: report.title || '',
          blocks: report.blocks || [],
          accessLevel: report.access_level || 'edit',
          category: report.category || 'my-reports',
          filters: report.filters || {
            timePeriod: 'Last 4 weeks',
            selectedDimensions: []
          },
          favorite: report.favorite || false,
          createdAt: report.created_at,
          updatedAt: report.updated_at
        }))
      }
    } catch (err) {
      console.error('❌ Exception loading reports:', err)
    }
  }

  // Fallback to localStorage
  console.log('📋 Loading reports from localStorage...')
  const reportsData = localStorage.getItem('cl-blocks-reports')
  if (reportsData) {
    const reports = JSON.parse(reportsData)
    return Object.values(reports)
  }

  return []
}

/**
 * Subscribe to real-time updates for a report
 */
export const subscribeToReport = (reportId, callback) => {
  if (!isSupabaseConfigured()) {
    return null
  }

  const channel = supabase
    .channel(`report:${reportId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'reports',
        filter: `id=eq.${reportId}`
      },
      (payload) => {
        const report = payload.new
        callback({
          id: report.id,
          title: report.title || '',
          blocks: report.blocks || [],
          accessLevel: report.access_level || 'edit',
          category: report.category || 'my-reports',
          filters: report.filters || {
            timePeriod: 'Last 4 weeks',
            selectedDimensions: []
          },
          favorite: report.favorite || false
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from real-time updates
 */
export const unsubscribeFromReport = (channel) => {
  if (channel && isSupabaseConfigured()) {
    supabase.removeChannel(channel)
  }
}

