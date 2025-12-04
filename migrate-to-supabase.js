/**
 * Migration script to move existing localStorage data to Supabase
 * 
 * Usage:
 * 1. Make sure you've set up Supabase (see SUPABASE_SETUP.md)
 * 2. Set your environment variables in .env
 * 3. Run: node migrate-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateReports() {
  console.log('🚀 Starting migration...\n')

  try {
    // Try to read from localStorage backup file (if you exported it)
    // Otherwise, this script would need to be run in the browser context
    // For now, we'll create a sample migration
    
    console.log('📝 Note: This script migrates data structure.')
    console.log('   For actual localStorage data, you can:')
    console.log('   1. Open browser DevTools')
    console.log('   2. Run: JSON.parse(localStorage.getItem("cl-blocks-reports"))')
    console.log('   3. Copy the output and save to a file')
    console.log('   4. Modify this script to read that file\n')

    // Check if reports table exists and has data
    const { data: existingReports, error: fetchError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)

    if (fetchError) {
      console.error('❌ Error connecting to Supabase:', fetchError.message)
      console.log('\n💡 Make sure:')
      console.log('   1. You created the reports table (see SUPABASE_SETUP.md)')
      console.log('   2. Your environment variables are correct')
      console.log('   3. Your Supabase project is active')
      process.exit(1)
    }

    if (existingReports && existingReports.length > 0) {
      console.log('⚠️  Reports already exist in Supabase.')
      console.log('   Skipping migration. Delete existing reports first if you want to re-migrate.\n')
      return
    }

    // Sample migration - you can modify this to read from a file
    const sampleReports = [
      {
        id: 'my-reports-1',
        title: '[Sample] OM Creative Performance review',
        blocks: [],
        access_level: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        },
        favorite: false
      },
      {
        id: 'my-reports-2',
        title: '[Sample] Q4 Marketing Performance',
        blocks: [],
        access_level: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        },
        favorite: false
      },
      {
        id: 'my-reports-3',
        title: '[Sample] Sales Dashboard 2024',
        blocks: [],
        access_level: 'edit',
        category: 'my-reports',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        },
        favorite: false
      },
      {
        id: 'shared-1',
        title: '[Sample] OM Creative Performance review',
        blocks: [],
        access_level: 'read',
        category: 'shared-with-me',
        filters: {
          timePeriod: 'Last 4 weeks',
          selectedDimensions: []
        },
        favorite: false
      }
    ]

    console.log(`📤 Migrating ${sampleReports.length} reports...`)

    const { data, error } = await supabase
      .from('reports')
      .upsert(sampleReports, { onConflict: 'id' })

    if (error) {
      console.error('❌ Error migrating reports:', error.message)
      process.exit(1)
    }

    console.log('✅ Migration complete!')
    console.log(`   Migrated ${sampleReports.length} reports to Supabase\n`)

    // Verify migration
    const { data: verifyData, error: verifyError } = await supabase
      .from('reports')
      .select('id, title, access_level')

    if (verifyError) {
      console.error('⚠️  Could not verify migration:', verifyError.message)
    } else {
      console.log('📋 Migrated reports:')
      verifyData.forEach(report => {
        console.log(`   - ${report.title} (${report.id}) [${report.access_level}]`)
      })
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run migration
migrateReports()

