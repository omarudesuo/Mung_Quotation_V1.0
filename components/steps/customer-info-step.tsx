"use client"

import type React from "react"

import { useRef } from "react"
import type { CustomerInfo } from "../quotation-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface CustomerInfoStepProps {
  customerInfo: CustomerInfo
  onUpdate: (customerInfo: CustomerInfo) => void
}

export function CustomerInfoStep({ customerInfo, onUpdate }: CustomerInfoStepProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onUpdate({ ...customerInfo, [name]: value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "logo" | "signature") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (fileType === "logo") {
        onUpdate({
          ...customerInfo,
          logo: file,
          logoUrl: event.target?.result as string,
        })
      } else {
        onUpdate({
          ...customerInfo,
          signature: file,
          signatureUrl: event.target?.result as string,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const removeFile = (fileType: "logo" | "signature") => {
    if (fileType === "logo") {
      onUpdate({
        ...customerInfo,
        logo: null,
        logoUrl: "",
      })
    } else {
      onUpdate({
        ...customerInfo,
        signature: null,
        signatureUrl: "",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName" className="text-base">
            Customer Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerName"
            name="customerName"
            value={customerInfo.customerName}
            onChange={handleInputChange}
            placeholder="Enter customer name"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="companyName" className="text-base">
            Company Name (Optional)
          </Label>
          <Input
            id="companyName"
            name="companyName"
            value={customerInfo.companyName}
            onChange={handleInputChange}
            placeholder="Enter company name"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-base block mb-2">Company Logo (Optional)</Label>
          <input
            type="file"
            ref={logoInputRef}
            onChange={(e) => handleFileChange(e, "logo")}
            accept="image/*"
            className="hidden"
          />

          {customerInfo.logoUrl ? (
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 border rounded-lg overflow-hidden">
              <Image
                src={customerInfo.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                fill
                className="object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeFile("logo")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Logo
            </Button>
          )}
        </div>

        <div>
          <Label className="text-base block mb-2">Signature (Optional)</Label>
          <input
            type="file"
            ref={signatureInputRef}
            onChange={(e) => handleFileChange(e, "signature")}
            accept="image/*"
            className="hidden"
          />

          {customerInfo.signatureUrl ? (
            <div className="relative w-36 h-18 sm:w-48 sm:h-24 border rounded-lg overflow-hidden">
              <Image
                src={customerInfo.signatureUrl || "/placeholder.svg"}
                alt="Signature"
                fill
                className="object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeFile("signature")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => signatureInputRef.current?.click()}
              className="flex items-center w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Signature
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
