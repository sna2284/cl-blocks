import { Separator } from '@/components/ui/separator'

export default function SeparatorBlock({ block, isReadOnly = false }) {
  return (
    <div className="py-4">
      <Separator />
    </div>
  )
}

