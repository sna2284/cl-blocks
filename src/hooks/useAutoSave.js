import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'cl-blocks-document'

export const useAutoSave = (blocks, delay = 1000) => {
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks))
      console.log('Auto-saved to localStorage')
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [blocks, delay])
}

export const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Error loading from storage:', error)
    return null
  }
}

