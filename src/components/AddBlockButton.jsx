import { forwardRef } from 'react'
import { Plus } from 'lucide-react'

const AddBlockButton = forwardRef(({ isOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 py-1"
      aria-label="Add block"
      {...props}
    >
      <Plus size={16} className={isOpen ? 'text-blue-500' : 'text-gray-400'} />
    </button>
  )
})

AddBlockButton.displayName = 'AddBlockButton'

export default AddBlockButton

