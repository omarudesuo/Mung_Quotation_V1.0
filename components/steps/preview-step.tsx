"use client"

import { useState, useRef } from "react"
import type { QuotationData } from "../quotation-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Mail, Phone, Printer } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import Image from "next/image"
// Import the document generator utilities
import { generateQuotationPDF } from "@/lib/document-generator"

interface PreviewStepProps {
  quotationData: QuotationData
  onSendEmail: (email: string) => void
  onSendWhatsApp: (phoneNumber: string) => void
}

// Add this function to ensure consistent document generation
const generatePDF = async (quotationRef: HTMLDivElement, quotationNumber: string) => {
  // Create a clone of the quotation element to avoid modifying the original
  const clone = quotationRef.cloneNode(true) as HTMLDivElement
  document.body.appendChild(clone)

  // Set fixed dimensions for consistent output
  clone.style.width = "794px" // A4 width in pixels at 96 DPI
  clone.style.padding = "40px"
  clone.style.position = "absolute"
  clone.style.left = "-9999px"
  clone.style.top = "-9999px"

  // Wait for images to load
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
    pdf.save(`Quotation-${quotationNumber}.pdf`)
  } finally {
    // Clean up
    document.body.removeChild(clone)
  }
}

export function PreviewStep({ quotationData, onSendEmail, onSendWhatsApp }: PreviewStepProps) {
  const [email, setEmail] = useState("")
  const [whatsAppNumber, setWhatsAppNumber] = useState("")
  const quotationRef = useRef<HTMLDivElement>(null)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const handlePrint = () => {
    window.print()
  }

  // Update the handleDownloadPDF function
  const handleDownloadPDF = async () => {
    if (!quotationRef.current) return
    await generateQuotationPDF(quotationRef.current, quotationData.quotationNumber)
  }

  const handleDownloadWord = () => {
    // This is a simplified approach - in a real app, you'd use a library like docx
    // to generate a proper Word document
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Quotation ${quotationData.quotationNumber}</title>
        </head>
        <body>
          ${quotationRef.current?.innerHTML}
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "application/msword" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Quotation-${quotationData.quotationNumber}.doc`
    link.click()
  }

  const calculateTotal = (item: any) => {
    return item.quantity * item.unitPrice
  }

  const calculateGrandTotal = () => {
    return quotationData.items.reduce((total, item) => total + calculateTotal(item), 0)
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="preview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="send">Send Options</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadWord}>
              <FileText className="mr-2 h-4 w-4" /> Word
            </Button>
          </div>

          {/* Quotation Preview */}
          <div
            ref={quotationRef}
            className="bg-white p-4 sm:p-8 border rounded-lg shadow-sm print:p-8"
            id="quotation-document"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-8">
              {quotationData.customerInfo.logoUrl && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded-full border mb-4 sm:mb-0">
                  <Image
                    src={quotationData.customerInfo.logoUrl || "/placeholder.svg"}
                    alt="Company Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="text-center sm:text-right">
                {quotationData.customerInfo.companyName && (
                  <h3 className="text-2xl sm:text-3xl font-bold">{quotationData.customerInfo.companyName}</h3>
                )}
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quotation</h1>
              <p className="text-lg font-medium text-gray-600">{quotationData.quotationNumber}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer</h3>
                <p>{quotationData.customerInfo.customerName}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="mb-2">
                  <span className="font-semibold">Date: </span>
                  <span>{formatDate(quotationData.creationDate)}</span>
                </div>
                <div>
                  <span className="font-semibold">Valid Until: </span>
                  <span>{formatDate(quotationData.validUntil)}</span>
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-right">Quantity</th>
                    <th className="border p-2 text-right">Unit Price (EGP)</th>
                    <th className="border p-2 text-right">Total (EGP)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2">{item.description}</td>
                      <td className="border p-2 text-right">{item.quantity}</td>
                      <td className="border p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="border p-2 text-right">{calculateTotal(item).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td colSpan={4} className="border p-2 text-right">
                      Grand Total:
                    </td>
                    <td className="border p-2 text-right">{calculateGrandTotal().toLocaleString()} EGP</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {quotationData.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="whitespace-pre-line">{quotationData.notes}</p>
              </div>
            )}

            {quotationData.customerInfo.signatureUrl && (
              <div className="flex justify-end">
                <div className="w-16 h-16 sm:w-20 sm:h-20 relative overflow-hidden rounded-full border">
                  <Image
                    src={quotationData.customerInfo.signatureUrl || "/placeholder.svg"}
                    alt="Signature"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <div className="space-y-4 border rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold">Send via Email</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={() => onSendEmail(email)} className="w-full sm:w-auto">
                  <Mail className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold">Send via WhatsApp</h3>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number (with country code)</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+201234567890"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                />
                <Button onClick={() => onSendWhatsApp(whatsAppNumber)} className="w-full sm:w-auto">
                  <Phone className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
