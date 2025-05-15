"use client"

import type React from "react"

import { useState } from "react"
import type { QuotationItem } from "../quotation-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MoveUp, MoveDown } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface ItemsStepProps {
  items: QuotationItem[]
  notes: string
  onUpdate: (items: QuotationItem[], notes: string) => void
}

export function ItemsStep({ items, notes, onUpdate }: ItemsStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<QuotationItem>({
    id: "",
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleAddItem = () => {
    setIsEditing(false)
    setCurrentItem({
      id: uuidv4(),
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: QuotationItem) => {
    setIsEditing(true)
    setCurrentItem({ ...item })
    setIsDialogOpen(true)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    onUpdate(updatedItems, notes)
  }

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === items.length - 1)) {
      return
    }

    const newItems = [...items]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    onUpdate(newItems, notes)
  }

  const handleSaveItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert("Please fill in all required fields with valid values")
      return
    }

    let updatedItems: QuotationItem[]
    if (isEditing) {
      updatedItems = items.map((item) => (item.id === currentItem.id ? currentItem : item))
    } else {
      updatedItems = [...items, currentItem]
    }

    onUpdate(updatedItems, notes)
    setIsDialogOpen(false)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(items, e.target.value)
  }

  const calculateTotal = (item: QuotationItem) => {
    return item.quantity * item.unitPrice
  }

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + calculateTotal(item), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Items</h3>
        <Button onClick={handleAddItem} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="w-[15%] text-right">Quantity</TableHead>
                <TableHead className="w-[20%] text-right">Unit Price (EGP)</TableHead>
                <TableHead className="w-[15%] text-right">Total (EGP)</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{calculateTotal(item).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === items.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Grand Total:
                </TableCell>
                <TableCell className="text-right font-bold">{calculateGrandTotal().toLocaleString()} EGP</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center text-muted-foreground">
          No items added yet. Click the &quot;Add Item&quot; button to add your first item.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add any additional notes here (e.g., 'Thank you for your business')"
          className="min-h-[100px]"
        />
      </div>

      {/* Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemName"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Description (Optional)</Label>
              <Textarea
                id="itemDescription"
                value={currentItem.description}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    description: e.target.value,
                  })
                }
                placeholder="Enter item description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemQuantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="itemQuantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      quantity: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemUnitPrice">
                  Unit Price (EGP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="itemUnitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      unitPrice: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
