// Run this in the browser console to check report counts
// Or use this as a Node script if you have access to localStorage

function countReports() {
  try {
    const reportsData = localStorage.getItem('cl-blocks-reports')
    
    if (!reportsData) {
      console.log('No reports found in localStorage')
      return {
        editable: 0,
        nonEditable: 0,
        total: 0
      }
    }
    
    const reports = JSON.parse(reportsData)
    const reportArray = Object.values(reports)
    
    const editable = reportArray.filter(r => r.accessLevel === 'edit').length
    const nonEditable = reportArray.filter(r => r.accessLevel === 'read').length
    
    const result = {
      editable,
      nonEditable,
      total: editable + nonEditable,
      details: {
        editableReports: reportArray.filter(r => r.accessLevel === 'edit').map(r => ({ id: r.id, title: r.title })),
        nonEditableReports: reportArray.filter(r => r.accessLevel === 'read').map(r => ({ id: r.id, title: r.title }))
      }
    }
    
    console.log('Report Counts:')
    console.log(`Editable reports: ${editable}`)
    console.log(`Non-editable reports: ${nonEditable}`)
    console.log(`Total reports: ${result.total}`)
    console.log('\nDetails:', result.details)
    
    return result
  } catch (error) {
    console.error('Error counting reports:', error)
    return null
  }
}

// If running in browser console, just call: countReports()
// If running as a module, export it
if (typeof module !== 'undefined' && module.exports) {
  module.exports = countReports
}

