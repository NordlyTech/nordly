import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Fan, Lightbulb, HardDrives, ForkKnife } from '@phosphor-icons/react'
import { Equipment } from '@/components/EquipmentOptimization'

const EQUIPMENT_TYPES = [
  { value: 'hvac', label: 'HVAC System', icon: Fan },
  { value: 'lighting', label: 'Lighting', icon: Lightbulb },
  { value: 'servers', label: 'Server/IT Equipment', icon: HardDrives },
  { value: 'kitchen', label: 'Kitchen Equipment', icon: ForkKnife },
] as const

interface AddEquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (equipment: Omit<Equipment, 'id'>) => void
}

export function AddEquipmentDialog({ open, onOpenChange, onAdd }: AddEquipmentDialogProps) {
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    type: 'hvac',
    name: '',
    quantity: 1,
    powerRating: 0,
    hoursPerDay: 8,
    age: undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.powerRating <= 0) return

    onAdd(formData)
    setFormData({
      type: 'hvac',
      name: '',
      quantity: 1,
      powerRating: 0,
      hoursPerDay: 8,
      age: undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Equipment</DialogTitle>
          <DialogDescription>
            Add equipment to track its energy consumption and identify savings opportunities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="equipment-type">Equipment Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as Equipment['type'] })}
            >
              <SelectTrigger id="equipment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-name">Equipment Name</Label>
            <Input
              id="equipment-name"
              placeholder="e.g., Main Floor AC Unit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="power-rating">Power Rating (Watts)</Label>
              <Input
                id="power-rating"
                type="number"
                min="1"
                placeholder="e.g., 3000"
                value={formData.powerRating || ''}
                onChange={(e) => setFormData({ ...formData, powerRating: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours-per-day">Hours per Day</Label>
              <Input
                id="hours-per-day"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (years, optional)</Label>
              <Input
                id="age"
                type="number"
                min="0"
                placeholder="Optional"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Equipment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
