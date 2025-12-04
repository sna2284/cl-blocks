import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Bold, Italic, Strikethrough, Link, Code, List, ListOrdered, Quote, Minus, ChevronsUpDown, CaseSensitive, Heading1, Heading2, Heading3, TextQuote } from 'lucide-react'

// Dummy user data with real names - 3 users per alphabet
const COMPANY_USERS = [
  { id: 'a-1', name: 'Alice Anderson', email: 'alice.anderson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: 'a-2', name: 'Alex Adams', email: 'alex.adams@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'a-3', name: 'Amy Allen', email: 'amy.allen@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy' },
  { id: 'b-1', name: 'Bob Brown', email: 'bob.brown@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: 'b-2', name: 'Beth Baker', email: 'beth.baker@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beth' },
  { id: 'b-3', name: 'Ben Brooks', email: 'ben.brooks@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben' },
  { id: 'c-1', name: 'Charlie Chen', email: 'charlie.chen@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  { id: 'c-2', name: 'Clara Clark', email: 'clara.clark@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara' },
  { id: 'c-3', name: 'Chris Cooper', email: 'chris.cooper@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
  { id: 'd-1', name: 'David Davis', email: 'david.davis@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { id: 'd-2', name: 'Diana Diaz', email: 'diana.diaz@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana' },
  { id: 'd-3', name: 'Daniel Dunn', email: 'daniel.dunn@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel' },
  { id: 'e-1', name: 'Emma Evans', email: 'emma.evans@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
  { id: 'e-2', name: 'Ethan Edwards', email: 'ethan.edwards@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan' },
  { id: 'e-3', name: 'Emily Ellis', email: 'emily.ellis@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: 'f-1', name: 'Frank Foster', email: 'frank.foster@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' },
  { id: 'f-2', name: 'Fiona Fisher', email: 'fiona.fisher@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona' },
  { id: 'f-3', name: 'Felix Fox', email: 'felix.fox@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'g-1', name: 'Grace Green', email: 'grace.green@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Grace' },
  { id: 'g-2', name: 'George Garcia', email: 'george.garcia@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George' },
  { id: 'g-3', name: 'Gina Grant', email: 'gina.grant@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gina' },
  { id: 'h-1', name: 'Henry Harris', email: 'henry.harris@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry' },
  { id: 'h-2', name: 'Hannah Hill', email: 'hannah.hill@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah' },
  { id: 'h-3', name: 'Hugo Hayes', email: 'hugo.hayes@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hugo' },
  { id: 'i-1', name: 'Isabella Ingram', email: 'isabella.ingram@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella' },
  { id: 'i-2', name: 'Ian Irwin', email: 'ian.irwin@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ian' },
  { id: 'i-3', name: 'Ivy Iverson', email: 'ivy.iverson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy' },
  { id: 'j-1', name: 'James Johnson', email: 'james.johnson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
  { id: 'j-2', name: 'Julia Jones', email: 'julia.jones@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia' },
  { id: 'j-3', name: 'Jack Jackson', email: 'jack.jackson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
  { id: 'k-1', name: 'Kate Kelly', email: 'kate.kelly@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate' },
  { id: 'k-2', name: 'Kevin King', email: 'kevin.king@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin' },
  { id: 'k-3', name: 'Kara Kim', email: 'kara.kim@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kara' },
  { id: 'l-1', name: 'Liam Lee', email: 'liam.lee@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
  { id: 'l-2', name: 'Lily Lewis', email: 'lily.lewis@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily' },
  { id: 'l-3', name: 'Luke Lopez', email: 'luke.lopez@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luke' },
  { id: 'm-1', name: 'Mia Martinez', email: 'mia.martinez@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia' },
  { id: 'm-2', name: 'Michael Moore', email: 'michael.moore@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: 'm-3', name: 'Maya Miller', email: 'maya.miller@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya' },
  { id: 'n-1', name: 'Noah Nelson', email: 'noah.nelson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
  { id: 'n-2', name: 'Nina Nguyen', email: 'nina.nguyen@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina' },
  { id: 'n-3', name: 'Nathan Norris', email: 'nathan.norris@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nathan' },
  { id: 'o-1', name: 'Olivia Owens', email: 'olivia.owens@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
  { id: 'o-2', name: 'Owen Oliver', email: 'owen.oliver@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owen' },
  { id: 'o-3', name: 'Oscar Ortiz', email: 'oscar.ortiz@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar' },
  { id: 'p-1', name: 'Paul Parker', email: 'paul.parker@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paul' },
  { id: 'p-2', name: 'Paula Peterson', email: 'paula.peterson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paula' },
  { id: 'p-3', name: 'Peter Phillips', email: 'peter.phillips@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter' },
  { id: 'q-1', name: 'Quinn Quinn', email: 'quinn.quinn@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn' },
  { id: 'q-2', name: 'Quincy Qualls', email: 'quincy.qualls@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quincy' },
  { id: 'q-3', name: 'Quiana Quick', email: 'quiana.quick@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quiana' },
  { id: 'r-1', name: 'Rachel Roberts', email: 'rachel.roberts@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel' },
  { id: 'r-2', name: 'Ryan Reed', email: 'ryan.reed@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan' },
  { id: 'r-3', name: 'Rose Rivera', email: 'rose.rivera@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rose' },
  { id: 's-1', name: 'Sophia Smith', email: 'sophia.smith@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
  { id: 's-2', name: 'Samuel Scott', email: 'samuel.scott@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel' },
  { id: 's-3', name: 'Sarah Stewart', email: 'sarah.stewart@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 't-1', name: 'Thomas Taylor', email: 'thomas.taylor@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas' },
  { id: 't-2', name: 'Taylor Thompson', email: 'taylor.thompson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
  { id: 't-3', name: 'Tyler Turner', email: 'tyler.turner@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler' },
  { id: 'u-1', name: 'Uma Underwood', email: 'uma.underwood@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Uma' },
  { id: 'u-2', name: 'Ulysses Urban', email: 'ulysses.urban@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ulysses' },
  { id: 'u-3', name: 'Ursula Upton', email: 'ursula.upton@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ursula' },
  { id: 'v-1', name: 'Victoria Vega', email: 'victoria.vega@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victoria' },
  { id: 'v-2', name: 'Victor Vaughn', email: 'victor.vaughn@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victor' },
  { id: 'v-3', name: 'Violet Vance', email: 'violet.vance@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Violet' },
  { id: 'w-1', name: 'William White', email: 'william.white@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=William' },
  { id: 'w-2', name: 'Willow Wilson', email: 'willow.wilson@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow' },
  { id: 'w-3', name: 'Wyatt Wright', email: 'wyatt.wright@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wyatt' },
  { id: 'x-1', name: 'Xavier Xu', email: 'xavier.xu@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Xavier' },
  { id: 'x-2', name: 'Xara Xiong', email: 'xara.xiong@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Xara' },
  { id: 'x-3', name: 'Xander Xie', email: 'xander.xie@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Xander' },
  { id: 'y-1', name: 'Yara Young', email: 'yara.young@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yara' },
  { id: 'y-2', name: 'Yuki Yamamoto', email: 'yuki.yamamoto@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki' },
  { id: 'y-3', name: 'Yvonne York', email: 'yvonne.york@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yvonne' },
  { id: 'z-1', name: 'Zoe Zhang', email: 'zoe.zhang@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe' },
  { id: 'z-2', name: 'Zachary Zimmerman', email: 'zachary.zimmerman@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zachary' },
  { id: 'z-3', name: 'Zara Zane', email: 'zara.zane@company.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara' },
]

export default function TextBlock({ block, onUpdate, isFocused, onFocus, onCommandMenu, onScrollToBlock, isReadOnly = false, onInsertSeparator, onOpenCommandMenu }) {
  const contentRef = useRef(null)
  const toolbarRef = useRef(null)
  const [isEmpty, setIsEmpty] = useState(!block.content || block.content.trim() === '' || block.content === '<br>' || block.content === '<div><br></div>')
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [currentStyle, setCurrentStyle] = useState('text')
  const [emptyLinePlaceholders, setEmptyLinePlaceholders] = useState([])
  const [activePlaceholderStyle, setActivePlaceholderStyle] = useState('text')
  const [showMentionMenu, setShowMentionMenu] = useState(false)
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [mentionQuery, setMentionQuery] = useState('')
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const mentionMenuRef = useRef(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkInputRef = useRef(null)
  const linkButtonRef = useRef(null)
  const linkSelectionRange = useRef(null)

  useEffect(() => {
    if (isFocused && contentRef.current) {
      contentRef.current.focus()
      // Move cursor to end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(contentRef.current)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
      // Update active placeholder style
      setActivePlaceholderStyle(getCurrentBlockStyle())
    }
  }, [isFocused])

  useEffect(() => {
    if (isFocused && contentRef.current) {
      const updateActiveStyle = () => {
        setActivePlaceholderStyle(getCurrentBlockStyle())
      }
      
      const handleKeyUp = () => {
        setTimeout(updateActiveStyle, 10)
      }
      
      const handleClick = () => {
        setTimeout(updateActiveStyle, 10)
      }
      
      contentRef.current.addEventListener('keyup', handleKeyUp)
      contentRef.current.addEventListener('click', handleClick)
      
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('keyup', handleKeyUp)
          contentRef.current.removeEventListener('click', handleClick)
        }
      }
    }
  }, [isFocused])

  const checkForSeparator = (newContent) => {
    if (!contentRef.current || isReadOnly || !onInsertSeparator) return false
    
    // First, check if the entire content is just "---"
    const allText = contentRef.current.textContent || ''
    if (allText.trim() === '---') {
      // Clear the content
      onUpdate({ ...block, content: '' })
      if (contentRef.current) {
        contentRef.current.innerHTML = ''
      }
      setTimeout(() => {
        if (onInsertSeparator) {
          onInsertSeparator(block.id)
        }
      }, 0)
      return true
    }
    
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return false
    
    const range = selection.getRangeAt(0)
    
    // Find the current line/paragraph element containing the cursor
    let lineElement = range.commonAncestorContainer
    if (lineElement.nodeType === Node.TEXT_NODE) {
      lineElement = lineElement.parentElement
    }
    
    // Walk up to find block-level element (div, p, etc.)
    while (lineElement && lineElement !== contentRef.current) {
      const tagName = lineElement.tagName?.toLowerCase()
      if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
        break
      }
      lineElement = lineElement.parentElement
    }
    
    if (!lineElement || lineElement === contentRef.current) return false
    
    // Get text content of the current line
    const lineText = lineElement.textContent || ''
    const trimmedLine = lineText.trim()
    
    // Check if line contains exactly "---"
    if (trimmedLine === '---') {
      // Create a temporary div to manipulate the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = newContent || contentRef.current.innerHTML
      
      // Find and remove the line element containing "---"
      const allElements = tempDiv.querySelectorAll('div, p, h1, h2, h3, h4, h5, h6, blockquote')
      let foundAndRemoved = false
      
      for (const el of allElements) {
        if (el.textContent.trim() === '---') {
          el.remove()
          foundAndRemoved = true
          break
        }
      }
      
      // If not found in block elements, check direct children
      if (!foundAndRemoved) {
        Array.from(tempDiv.children).forEach(child => {
          if (child.textContent.trim() === '---') {
            child.remove()
            foundAndRemoved = true
          }
        })
      }
      
      // Get the cleaned content
      const updatedContent = tempDiv.innerHTML.trim() || ''
      
      // Update block content without the "---" line
      onUpdate({ ...block, content: updatedContent })
      
      // Update the DOM
      if (contentRef.current) {
        contentRef.current.innerHTML = updatedContent
      }
      
      // Trigger separator insertion
      setTimeout(() => {
        if (onInsertSeparator) {
          onInsertSeparator(block.id)
        }
      }, 0)
      
      return true
    }
    
    return false
  }

  const handleInput = (e) => {
    if (isReadOnly) return
    // Get innerHTML to preserve line breaks created by Enter
    const newContent = e.target.innerHTML
    
    // Check for separator trigger first
    if (checkForSeparator(newContent)) {
      return // Separator insertion will handle the update
    }
    
    const textContent = e.target.textContent.trim()
    setIsEmpty(textContent === '')
    if (isFocused) {
      setTimeout(() => setActivePlaceholderStyle(getCurrentBlockStyle()), 10)
    }
    
    // Check for @ mention
    checkForMention()
    
    onUpdate({ ...block, content: newContent })
  }

  const checkForMention = () => {
    if (!contentRef.current) return
    
    const selection = window.getSelection()
    if (selection.rangeCount === 0) {
      setShowMentionMenu(false)
      return
    }
    
    const range = selection.getRangeAt(0)
    const allText = contentRef.current.textContent || ''
    const cursorPosition = getCursorPosition()
    
    // Find @ symbol before cursor
    let atIndex = -1
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (allText[i] === '@') {
        atIndex = i
        break
      }
      // Stop if we hit a space or newline
      if (allText[i] === ' ' || allText[i] === '\n') {
        break
      }
    }
    
    if (atIndex !== -1) {
      const query = allText.substring(atIndex + 1, cursorPosition).toLowerCase()
      // Check if we're still in a mention (no space after @)
      if (query.length === 0 || !query.includes(' ')) {
        setMentionQuery(query)
        setSelectedMentionIndex(0)
        
        // Position dropdown at cursor
        const rect = range.getBoundingClientRect()
        const containerRect = contentRef.current.getBoundingClientRect()
        setMentionPosition({
          top: rect.top - containerRect.top + rect.height + 5,
          left: rect.left - containerRect.left,
        })
        setShowMentionMenu(true)
      } else {
        setShowMentionMenu(false)
      }
    } else {
      setShowMentionMenu(false)
    }
  }

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value)
    contentRef.current?.focus()
    handleInput({ target: contentRef.current })
  }

  const createLink = () => {
    if (!contentRef.current) {
      return
    }

    if (!linkUrl.trim()) {
      setShowLinkDialog(false)
      setLinkUrl('')
      linkSelectionRange.current = null
      return
    }

    // Ensure URL has protocol
    let url = linkUrl.trim()
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url
    }

    // Restore focus to contentEditable first
    contentRef.current.focus()
    
    // Try to use stored range, fallback to current selection
    const selection = window.getSelection()
    let range = null
    let selectedText = ''
    
    // First try stored range
    if (linkSelectionRange.current) {
      try {
        const storedRange = linkSelectionRange.current.cloneRange()
        selectedText = storedRange.toString()
        if (selectedText && storedRange.commonAncestorContainer) {
          // Check if the range is still valid
          const container = storedRange.commonAncestorContainer
          if (contentRef.current.contains(container) || container === contentRef.current || contentRef.current.contains(container.parentElement)) {
            range = storedRange
          }
        }
      } catch (e) {
        // Range is invalid, will use current selection
      }
    }
    
    // If stored range didn't work, try current selection
    if (!range && selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
      selectedText = range.toString()
    }
    
    if (!range || !selectedText) {
      setShowLinkDialog(false)
      setLinkUrl('')
      linkSelectionRange.current = null
      return
    }

    // Create link element
    const linkElement = document.createElement('a')
    linkElement.href = url
    linkElement.textContent = selectedText
    linkElement.setAttribute('target', '_blank')
    linkElement.setAttribute('rel', 'noopener noreferrer')
    linkElement.style.color = '#2563eb'
    linkElement.style.textDecoration = 'underline'
    linkElement.style.cursor = 'pointer'
    
    // Delete selected content and insert link
    range.deleteContents()
    range.insertNode(linkElement)
    
    // Move cursor after the link
    const newRange = document.createRange()
    newRange.setStartAfter(linkElement)
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)

    handleInput({ target: contentRef.current })
    setShowLinkDialog(false)
    setLinkUrl('')
    linkSelectionRange.current = null
  }

  const handleLinkClick = (e) => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      // Store the current selection range
      linkSelectionRange.current = selection.getRangeAt(0).cloneRange()
      setLinkUrl('')
      setShowLinkDialog(true)
      setTimeout(() => {
        linkInputRef.current?.focus()
      }, 100)
    }
  }

  const applyStyle = (style) => {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString()
    
    // For block-level styles (headings, quote), apply to the current line/paragraph only
    if (['h1', 'h2', 'h3', 'quote', 'text'].includes(style)) {
      // Find the current block element (line/paragraph) containing the selection
      let blockElement = range.commonAncestorContainer
      
      // If it's a text node, get its parent
      if (blockElement.nodeType === Node.TEXT_NODE) {
        blockElement = blockElement.parentElement
      }
      
      // Find the nearest block-level element (div, p, h1-h6, blockquote, etc.)
      while (blockElement && blockElement !== contentRef.current) {
        const tagName = blockElement.tagName?.toLowerCase()
        if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tagName)) {
          break
        }
        blockElement = blockElement.parentElement
      }
      
      // If no block element found, create a new one from the current selection
      if (!blockElement || blockElement === contentRef.current) {
        // Select the current line by expanding to line boundaries
        const lineRange = range.cloneRange()
        lineRange.selectNodeContents(range.commonAncestorContainer)
        
        // Try to find or create a paragraph/div for this line
        const textNode = range.startContainer.nodeType === Node.TEXT_NODE 
          ? range.startContainer 
          : range.startContainer.firstChild
        
        if (textNode && textNode.parentElement) {
          blockElement = textNode.parentElement
        } else {
          // Fallback: wrap selection in a div
          const div = document.createElement('div')
          div.appendChild(range.extractContents())
          range.insertNode(div)
          blockElement = div
        }
      }
      
      // Select the block element
      const blockRange = document.createRange()
      blockRange.selectNodeContents(blockElement)
      selection.removeAllRanges()
      selection.addRange(blockRange)
      
      // Apply the block format
      switch (style) {
        case 'h1':
          document.execCommand('formatBlock', false, '<h1>')
          break
        case 'h2':
          document.execCommand('formatBlock', false, '<h2>')
          break
        case 'h3':
          document.execCommand('formatBlock', false, '<h3>')
          break
        case 'quote':
          document.execCommand('formatBlock', false, '<blockquote>')
          break
        case 'text':
          document.execCommand('formatBlock', false, '<div>')
          break
      }
      
      contentRef.current?.focus()
      handleInput({ target: contentRef.current })
      setCurrentStyle(style)
      setActivePlaceholderStyle(style)
    } else {
      // Apply formatting to selection
      switch (style) {
        case 'bold':
          formatText('bold')
          break
        case 'italic':
          formatText('italic')
          break
        case 'strikethrough':
          formatText('strikeThrough')
          break
        case 'code':
          formatText('formatBlock', '<code>')
          break
      }
    }
  }

  const getCurrentBlockStyle = () => {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return 'text'
    
    const range = selection.getRangeAt(0)
    let element = range.commonAncestorContainer
    
    // If it's a text node, get its parent
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement
    }
    
    // Walk up to find the block-level element
    while (element && element !== contentRef.current) {
      const tagName = element.tagName?.toLowerCase()
      if (tagName === 'h1') return 'h1'
      if (tagName === 'h2') return 'h2'
      if (tagName === 'h3') return 'h3'
      if (tagName === 'blockquote') return 'quote'
      if (['div', 'p'].includes(tagName)) return 'text'
      element = element.parentElement
    }
    
    return 'text'
  }

  const handleSelection = () => {
    if (isReadOnly) {
      setShowToolbar(false)
      return
    }
    const selection = window.getSelection()
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      // Use viewport coordinates for fixed positioning (getBoundingClientRect already returns viewport coords)
      setToolbarPosition({
        top: rect.top - 40,
        left: rect.left,
      })
      setShowToolbar(true)
      // Update current style based on selection
      setCurrentStyle(getCurrentBlockStyle())
    } else {
      setShowToolbar(false)
    }
  }

  const getFilteredUsers = () => {
    if (!mentionQuery) return COMPANY_USERS.slice(0, 10)
    const query = mentionQuery.toLowerCase()
    return COMPANY_USERS.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    ).slice(0, 10)
  }

  const insertMentionBadge = (user) => {
    if (!contentRef.current) return
    
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    
    // Get all text content to find @ position
    const allText = contentRef.current.textContent || ''
    const cursorPosition = getCursorPosition()
    
    // Find @ symbol before cursor
    let atIndex = -1
    for (let i = cursorPosition - 1; i >= 0; i--) {
      if (allText[i] === '@') {
        atIndex = i
        break
      }
      if (allText[i] === ' ' || allText[i] === '\n') {
        break
      }
    }
    
    if (atIndex === -1) {
      setShowMentionMenu(false)
      return
    }
    
    // Create a range that spans from @ to cursor
    const walker = document.createTreeWalker(
      contentRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let charCount = 0
    let startNode = null
    let startOffset = 0
    let endNode = null
    let endOffset = 0
    
    let textNode = walker.nextNode()
    while (textNode) {
      const nodeLength = textNode.textContent.length
      
      if (startNode === null && charCount + nodeLength > atIndex) {
        startNode = textNode
        startOffset = atIndex - charCount
      }
      
      if (charCount + nodeLength >= cursorPosition) {
        endNode = textNode
        endOffset = cursorPosition - charCount
        break
      }
      
      charCount += nodeLength
      textNode = walker.nextNode()
    }
    
    if (!startNode || !endNode) {
      setShowMentionMenu(false)
      return
    }
    
    // Create range and delete content
    const mentionRange = document.createRange()
    mentionRange.setStart(startNode, startOffset)
    mentionRange.setEnd(endNode, endOffset)
    mentionRange.deleteContents()
    
    // Create badge element
    const badge = document.createElement('span')
    badge.className = 'mention-badge inline-flex items-center rounded-sm px-1 bg-muted cursor-pointer'
    badge.setAttribute('data-user-id', user.id)
    badge.setAttribute('data-user-name', user.name)
    badge.setAttribute('data-user-email', user.email)
    badge.setAttribute('data-user-avatar', user.avatar)
    badge.setAttribute('contenteditable', 'false')
    badge.textContent = user.name
    
    // Add click handler for popover
    badge.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const userId = badge.getAttribute('data-user-id')
      const user = COMPANY_USERS.find(u => u.id === userId)
      if (user && contentRef.current) {
        const rect = badge.getBoundingClientRect()
        const containerRect = contentRef.current.getBoundingClientRect()
        const popoverWidth = 256 // w-64 = 256px
        const badgeCenter = rect.left - containerRect.left + rect.width / 2
        setPopoverPosition({
          top: rect.top - containerRect.top - 8,
          left: badgeCenter - popoverWidth / 2,
        })
        setSelectedUser(user)
        setPopoverOpen(true)
      }
    })
    
    // Insert badge
    mentionRange.insertNode(badge)
    
    // Add space after badge
    const spaceNode = document.createTextNode(' ')
    badge.parentNode.insertBefore(spaceNode, badge.nextSibling)
    
    // Create an empty text node for cursor positioning (using zero-width space)
    const cursorNode = document.createTextNode('\u200B')
    spaceNode.parentNode.insertBefore(cursorNode, spaceNode.nextSibling)
    
    // Position cursor in the cursor node
    const newRange = document.createRange()
    newRange.setStart(cursorNode, 0)
    newRange.setEnd(cursorNode, 0)
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)
    
    // Ensure focus
    contentRef.current.focus()
    
    setShowMentionMenu(false)
    setMentionQuery('')
    handleInput({ target: contentRef.current })
  }

  const getCursorPosition = () => {
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return 0
    
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(contentRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  const handleKeyDown = (e) => {
    if (isReadOnly) {
      // Allow basic navigation but prevent editing
      if (e.key === '/' && onCommandMenu) {
        e.preventDefault()
        return
      }
      // Prevent editing shortcuts
      if ((e.metaKey || e.ctrlKey) && ['b', 'i', 'u'].includes(e.key)) {
        e.preventDefault()
        return
      }
      return
    }
    
    // Handle mention menu navigation
    if (showMentionMenu) {
      const filteredUsers = getFilteredUsers()
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        )
        return
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0))
        return
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (filteredUsers[selectedMentionIndex]) {
          insertMentionBadge(filteredUsers[selectedMentionIndex])
        }
        return
      }
      
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionMenu(false)
        return
      }
    }
    
    // Handle backspace to delete mention badge (works even when menu is not showing)
    if (e.key === 'Backspace') {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const node = range.startContainer
        
        // Check if cursor is right after a mention badge
        if (node.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
          const prevSibling = node.previousSibling
          if (prevSibling && prevSibling.classList && prevSibling.classList.contains('mention-badge')) {
            e.preventDefault()
            prevSibling.remove()
            handleInput({ target: contentRef.current })
            return
          }
        }
        
        // Check if we're inside or at the start of a mention badge
        let checkNode = node
        if (node.nodeType === Node.TEXT_NODE) {
          checkNode = node.parentElement
        }
        if (checkNode && checkNode.classList && checkNode.classList.contains('mention-badge')) {
          e.preventDefault()
          checkNode.remove()
          handleInput({ target: contentRef.current })
          return
        }
      }
    }
    
    // Keyboard shortcuts
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault()
      formatText('bold')
      return
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault()
      formatText('italic')
      return
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
      e.preventDefault()
      formatText('underline')
      return
    }

    // Check for separator trigger when typing "-"
    if (e.key === '-') {
      // Use setTimeout to check after the dash is inserted
      setTimeout(() => {
        if (contentRef.current) {
          const newContent = contentRef.current.innerHTML
          checkForSeparator(newContent)
        }
      }, 0)
    }

    // Check for command menu trigger when typing "/" at start of line
    if (e.key === '/' && onOpenCommandMenu) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        
        // Find the current line/paragraph element containing the cursor
        let lineElement = range.commonAncestorContainer
        if (lineElement.nodeType === Node.TEXT_NODE) {
          lineElement = lineElement.parentElement
        }
        
        // Walk up to find block-level element (div, p, etc.)
        while (lineElement && lineElement !== contentRef.current) {
          const tagName = lineElement.tagName?.toLowerCase()
          if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
            break
          }
          lineElement = lineElement.parentElement
        }
        
        // Check if cursor is at the start of the line
        let isAtStartOfLine = false
        
        if (lineElement && lineElement !== contentRef.current) {
          // Get the text content of the line up to the cursor
          const lineRange = document.createRange()
          lineRange.selectNodeContents(lineElement)
          lineRange.setEnd(range.endContainer, range.endOffset)
          const textBeforeCursor = lineRange.toString()
          
          // Check if there's only whitespace or nothing before cursor
          isAtStartOfLine = textBeforeCursor.trim() === ''
        } else {
          // If no block element, check if cursor is at the start of content
          const cursorPosition = getCursorPosition()
          const allText = contentRef.current.textContent || ''
          const textBeforeCursor = allText.substring(0, cursorPosition)
          isAtStartOfLine = textBeforeCursor.trim() === '' || textBeforeCursor.endsWith('\n')
        }
        
        if (isAtStartOfLine) {
          e.preventDefault()
          
          // Open command menu at AddBlockButton position (prevent "/" from being inserted)
          if (onOpenCommandMenu) {
            onOpenCommandMenu()
          }
        }
      }
    }
    // Enter key now creates a new line within the same block (default behavior)
  }

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== (block.content || '')) {
      // Preserve cursor position before updating
      const selection = window.getSelection()
      let cursorPosition = null
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        cursorPosition = {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
        }
      }
      
      // Update content with innerHTML to preserve line breaks
      contentRef.current.innerHTML = block.content || ''
      setIsEmpty(!block.content || contentRef.current.textContent.trim() === '')
      
      // Try to restore cursor position (simplified - just move to end if restoration fails)
      if (cursorPosition) {
        try {
          const newRange = document.createRange()
          // Try to find a suitable text node near the cursor position
          const walker = document.createTreeWalker(
            contentRef.current,
            NodeFilter.SHOW_TEXT,
            null
          )
          let textNode = walker.nextNode()
          if (textNode) {
            const maxOffset = Math.min(cursorPosition.startOffset, textNode.textContent.length)
            newRange.setStart(textNode, maxOffset)
            newRange.setEnd(textNode, maxOffset)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }
        } catch (e) {
          // If cursor restoration fails, move to end
          const newRange = document.createRange()
          newRange.selectNodeContents(contentRef.current)
          newRange.collapse(false)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
    }
  }, [block.content])

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelection, 10)
    }

    const handleClick = () => {
      setTimeout(() => {
        const selection = window.getSelection()
        if (selection.rangeCount === 0 || selection.toString().length === 0) {
          setShowToolbar(false)
        }
      }, 10)
    }

    // Handle selection changes from keyboard (Shift+Arrow keys, etc.)
    const handleSelectionChange = () => {
      if (!contentRef.current) return
      
      const selection = window.getSelection()
      // Check if selection is within our contentEditable element
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const isWithinEditor = contentRef.current.contains(range.commonAncestorContainer) || 
                               contentRef.current === range.commonAncestorContainer
        
        if (isWithinEditor) {
          setTimeout(handleSelection, 10)
        }
      }
    }

    // Handle keyup events for keyboard selection (Shift+Arrow, etc.)
    const handleKeyUp = (e) => {
      // Check if Shift, Ctrl, or Cmd is held (common for text selection)
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        setTimeout(handleSelectionChange, 10)
      }
    }

    // Update toolbar position on scroll when toolbar is visible
    const handleScroll = () => {
      if (showToolbar) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          // Use viewport coordinates for fixed positioning
          setToolbarPosition({
            top: rect.top - 40,
            left: rect.left,
          })
        }
      }
    }

    if (contentRef.current) {
      contentRef.current.addEventListener('mouseup', handleMouseUp)
      contentRef.current.addEventListener('click', handleClick)
      contentRef.current.addEventListener('keyup', handleKeyUp)
      document.addEventListener('selectionchange', handleSelectionChange)
      window.addEventListener('scroll', handleScroll, true)
      return () => {
        if (contentRef.current) {
          contentRef.current.removeEventListener('mouseup', handleMouseUp)
          contentRef.current.removeEventListener('click', handleClick)
          contentRef.current.removeEventListener('keyup', handleKeyUp)
        }
        document.removeEventListener('selectionchange', handleSelectionChange)
        window.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [showToolbar])


  useEffect(() => {
    if (!isFocused && contentRef.current) {
      const placeholders = []
      const blockElements = contentRef.current.querySelectorAll('div, h1, h2, h3, p, blockquote')
      
      blockElements.forEach((element) => {
        const textContent = element.textContent?.trim() || ''
        const innerHTML = element.innerHTML?.trim() || ''
        const isEmpty = textContent === '' || 
                       textContent === '\u00A0' || 
                       innerHTML === '' || 
                       innerHTML === '<br>' || 
                       innerHTML === '<br/>' ||
                       innerHTML.replace(/&nbsp;/g, '').replace(/<br\s*\/?>/gi, '').trim() === ''
        
        if (isEmpty) {
          const rect = element.getBoundingClientRect()
          const containerRect = contentRef.current.getBoundingClientRect()
          const tagName = element.tagName?.toLowerCase()
          
          // Only add placeholder for H1 elements
          if (tagName === 'h1') {
            placeholders.push({
              top: rect.top - containerRect.top,
              left: rect.left - containerRect.left,
            })
          }
        }
      })
      
      setEmptyLinePlaceholders(placeholders)
    } else {
      setEmptyLinePlaceholders([])
    }
  }, [isFocused, block.content])

  // Attach click handlers to existing mention badges
  useEffect(() => {
    if (!contentRef.current) return

    const badges = contentRef.current.querySelectorAll('.mention-badge')
    const clickHandlers = []

    badges.forEach((badge) => {
      const handleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const userId = badge.getAttribute('data-user-id')
        const user = COMPANY_USERS.find(u => u.id === userId)
        if (user && contentRef.current) {
          const rect = badge.getBoundingClientRect()
          const containerRect = contentRef.current.getBoundingClientRect()
          const popoverWidth = 256 // w-64 = 256px
          const badgeCenter = rect.left - containerRect.left + rect.width / 2
          setPopoverPosition({
            top: rect.top - containerRect.top - 8,
            left: badgeCenter - popoverWidth / 2,
          })
          setSelectedUser(user)
          setPopoverOpen(true)
        }
      }
      
      badge.addEventListener('click', handleClick)
      badge.style.cursor = 'pointer'
      clickHandlers.push({ badge, handler: handleClick })
    })

    return () => {
      clickHandlers.forEach(({ badge, handler }) => {
        badge.removeEventListener('click', handler)
      })
    }
  }, [block.content])

  useEffect(() => {
    if (!contentRef.current) return

    const handleLinkClick = (e) => {
      const link = e.target.closest('a')
      if (link && link.href) {
        try {
          // Check if href is a hash link (starts with #)
          if (link.href.startsWith('#') || link.getAttribute('href')?.startsWith('#')) {
            e.preventDefault()
            const href = link.getAttribute('href') || link.href
            const blockId = href.startsWith('#') ? href.substring(1) : href
            if (blockId.startsWith('block-') && onScrollToBlock) {
              onScrollToBlock(blockId)
            }
          } else {
            // Try to parse as URL to check for hash
            const url = new URL(link.href)
            if (url.hash && url.hash.startsWith('#block-')) {
              e.preventDefault()
              const blockId = url.hash.substring(1)
              if (onScrollToBlock) {
                onScrollToBlock(blockId)
              }
            }
          }
        } catch (err) {
          // If URL parsing fails, check if href attribute starts with #
          const href = link.getAttribute('href')
          if (href && href.startsWith('#block-')) {
            e.preventDefault()
            const blockId = href.substring(1)
            if (onScrollToBlock) {
              onScrollToBlock(blockId)
            }
          }
        }
      }
    }

    contentRef.current.addEventListener('click', handleLinkClick)
    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleLinkClick)
      }
    }
  }, [onScrollToBlock])

  return (
    <div className="block-wrapper group relative">
      <div
        ref={contentRef}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className="outline-none min-h-[1.5rem] py-0 px-0 text-foreground rounded transition-colors prose prose-sm max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:my-2 [&_blockquote]:text-muted-foreground [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer"
      />
      {isEmpty && !isFocused && (
        <div className="absolute top-0 left-0 pointer-events-none text-muted-foreground">
          Enter text here...
        </div>
      )}
      {isEmpty && isFocused && (
        <div className={`absolute top-0 left-0 pointer-events-none text-muted-foreground ${
          activePlaceholderStyle === 'h1' ? 'text-3xl font-bold my-2' :
          activePlaceholderStyle === 'h2' ? 'text-2xl font-semibold my-2' :
          activePlaceholderStyle === 'h3' ? 'text-xl font-semibold my-2' :
          ''
        }`}>
          {['h1', 'h2', 'h3'].includes(activePlaceholderStyle) ? 'Enter heading here...' : 'Add your notes...'}
        </div>
      )}
      {!isFocused && emptyLinePlaceholders.map((placeholder, index) => (
        <div
          key={index}
          className="absolute pointer-events-none text-muted-foreground text-3xl font-bold my-2"
          style={{
            top: `${placeholder.top}px`,
            left: `${placeholder.left}px`,
          }}
        >
          Enter Heading here...
        </div>
      ))}
      {showToolbar && !isReadOnly && (
        <div
          ref={toolbarRef}
          className="fixed z-[5] flex items-center gap-1 p-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-white hover:bg-gray-800 hover:text-white">
                {currentStyle === 'h1' && (
                  <span className="text-xs">Heading 1</span>
                )}
                {currentStyle === 'h2' && (
                  <span className="text-xs">Heading 2</span>
                )}
                {currentStyle === 'h3' && (
                  <span className="text-xs">Heading 3</span>
                )}
                {currentStyle === 'quote' && (
                  <span className="text-xs">Quote</span>
                )}
                {currentStyle === 'text' && (
                  <span className="text-xs">Text</span>
                )}
                <ChevronsUpDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="z-[5]">
              <DropdownMenuItem onClick={() => applyStyle('text')}>
                <CaseSensitive className="h-4 w-4" />
                <span className="ml-2">Text</span>
                {currentStyle === 'text' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyStyle('h1')}>
                <Heading1 className="h-4 w-4" />
                <span className="ml-2">Heading 1</span>
                {currentStyle === 'h1' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyStyle('h2')}>
                <Heading2 className="h-4 w-4" />
                <span className="ml-2">Heading 2</span>
                {currentStyle === 'h2' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyStyle('h3')}>
                <Heading3 className="h-4 w-4" />
                <span className="ml-2">Heading 3</span>
                {currentStyle === 'h3' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyStyle('quote')}>
                <TextQuote className="h-4 w-4" />
                <span className="ml-2">Quote</span>
                {currentStyle === 'quote' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="h-4 w-px bg-gray-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:bg-gray-800 hover:text-white"
            onClick={() => applyStyle('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:bg-gray-800 hover:text-white"
            onClick={() => applyStyle('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:bg-gray-800 hover:text-white"
            onClick={() => applyStyle('strikethrough')}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          {!showLinkDialog ? (
            <Button
              ref={linkButtonRef}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-gray-800 hover:text-white"
              onClick={handleLinkClick}
            >
              <Link className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-1 px-2">
              <Input
                ref={linkInputRef}
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    createLink()
                  }
                  if (e.key === 'Escape') {
                    setShowLinkDialog(false)
                    setLinkUrl('')
                    linkSelectionRange.current = null
                  }
                }}
                className="h-8 w-48 text-sm bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-gray-800 hover:text-white"
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                  linkSelectionRange.current = null
                }}
              >
                ×
              </Button>
            </div>
          )}
        </div>
      )}
      {showMentionMenu && (
        <div
          ref={mentionMenuRef}
          className="absolute z-50 w-72 rounded-md border bg-popover p-1 text-popover-foreground shadow-md max-h-64 overflow-y-auto"
          style={{
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {getFilteredUsers().length > 0 ? (
            getFilteredUsers().map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent ${
                  index === selectedMentionIndex ? 'bg-accent' : ''
                }`}
                onClick={() => insertMentionBadge(user)}
                onMouseEnter={() => setSelectedMentionIndex(index)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No users found</div>
          )}
        </div>
      )}
      {popoverOpen && selectedUser && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopoverOpen(false)}
          />
          <div
            className="absolute z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="text-center">
                <div className="font-semibold text-sm">{selectedUser.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{selectedUser.email}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

