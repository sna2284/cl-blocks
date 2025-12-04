import { Draggable } from 'react-beautiful-dnd'
import { GripVertical, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import TextBlock from './blocks/TextBlock'
import TableBlock from './blocks/TableBlock'
import ChartBlock from './blocks/ChartBlock'
import SeparatorBlock from './blocks/SeparatorBlock'

export default function Block({ block, index, onUpdate, onDelete, isFocused, onFocus, onCommandMenu, onScrollToBlock, onOpenSidepanel, openSidepanelBlockId, isReadOnly = false, isReadOnlyModified = false, onReset, onInsertSeparator, onOpenCommandMenu }) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (isReadOnlyModified && (block.type === 'table' || block.type === 'chart')) {
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setShowBanner(false)
    }
  }, [isReadOnlyModified, block.type])

  const handleReset = () => {
    setShowBanner(false)
    setTimeout(() => {
      if (onReset) {
        onReset()
      }
    }, 300)
  }

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            block={block}
            onUpdate={onUpdate}
            isFocused={isFocused}
            onFocus={onFocus}
            onCommandMenu={onCommandMenu}
            onScrollToBlock={onScrollToBlock}
            isReadOnly={isReadOnly}
            onInsertSeparator={onInsertSeparator}
            onOpenCommandMenu={onOpenCommandMenu}
          />
        )
      case 'table':
        return <TableBlock block={block} onUpdate={onUpdate} onOpenSidepanel={onOpenSidepanel} isReadOnly={isReadOnly} isReadOnlyModified={isReadOnlyModified} />
      case 'chart':
        return <ChartBlock block={block} onUpdate={onUpdate} onOpenSidepanel={onOpenSidepanel} isReadOnly={isReadOnly} isReadOnlyModified={isReadOnlyModified} />
      case 'separator':
        return <SeparatorBlock block={block} isReadOnly={isReadOnly} />
      default:
        return <div>Unknown block type</div>
    }
  }

  // Determine border classes: yellow (read-only modified) takes priority over blue (Analyse panel open)
  const getBorderClasses = () => {
    if (block.type === 'text' || block.type === 'separator') return ''
    
    if (isReadOnlyModified && (block.type === 'table' || block.type === 'chart')) {
      return `border rounded-lg ${showBanner ? 'border-yellow-300' : 'border-gray-200'}`
    } else if (openSidepanelBlockId === block.id) {
      return `border rounded-lg border-blue-500 ring-2 ring-blue-100`
    } else {
      return `border rounded-lg border-gray-200`
    }
  }

  return (
    <Draggable draggableId={block.id} index={index} isDragDisabled={isReadOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-0 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <div className="relative group/block-hover">
            {!isReadOnly && (
              <div
                {...provided.dragHandleProps}
                className="absolute left-0 top-0 opacity-0 group-hover/block-hover:opacity-100 cursor-grab active:cursor-grabbing py-1 -translate-x-6 transition-opacity"
              >
                <GripVertical size={16} className="text-gray-400" />
              </div>
            )}
            <div className={`${getBorderClasses()} ${block.type === 'text' ? 'overflow-visible' : 'overflow-hidden'} transition-colors duration-300 ease-out`}>
              {/* Banner - only show when read-only modified */}
              {isReadOnlyModified && (block.type === 'table' || block.type === 'chart') && (
                <div className={`grid transition-all duration-300 ease-out ${
                  showBanner 
                    ? 'grid-rows-[1fr] opacity-100' 
                    : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    <div className="px-3 py-1.5 bg-yellow-100 text-xs text-yellow-800 flex items-center justify-between">
                      <span>Only visible to you. Changes are not saved in this report.</span>
                      {onReset && (
                        <button
                          onClick={handleReset}
                          className="ml-2 text-yellow-800 hover:text-yellow-900 font-medium"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <div className={`w-full ${block.type !== 'text' ? 'border-0 rounded-lg' : ''} p-0`}>{renderBlockContent()}</div>
              </div>
            </div>
            {!isReadOnly && (
              <button
                onClick={onDelete}
                className="absolute right-0 top-0 opacity-0 group-hover/block-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-opacity translate-x-6"
                aria-label="Delete block"
              >
                <Trash2 size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

