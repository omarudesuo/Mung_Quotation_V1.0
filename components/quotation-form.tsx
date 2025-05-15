"use client"

import { useState } from "react"
import { CustomerInfoStep } from "./steps/customer-info-step"
import { ItemsStep } from "./steps/items-step"
import { PreviewStep } from "./steps/preview-step"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type CustomerInfo = {
  customerName: string
  companyName: string
  logo: File | null
  logoUrl: string
  signature: File | null
  signatureUrl: string
}

export type QuotationItem = {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
}

export type QuotationData = {
  customerInfo: CustomerInfo
  items: QuotationItem[]
  notes: string
  quotationNumber: string
  creationDate: Date
  validUntil: Date
}

export function QuotationForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quotationData, setQuotationData] = useState<QuotationData>({
    customerInfo: {
      customerName: "",
      companyName: "",
      logo: null,
      logoUrl: "",
      signature: null,
      signatureUrl: "",
    },
    items: [],
    notes: "",
    quotationNumber: generateQuotationNumber(),
    creationDate: new Date(),
    validUntil: new Date(new Date().setDate(new Date().getDate() + 7)),
  })

  const steps = [
    {
      title: "Customer Information",
      component: (
        <CustomerInfoStep
          customerInfo={quotationData.customerInfo}
          onUpdate={(customerInfo) => setQuotationData({ ...quotationData, customerInfo })}
        />
      ),
      isValid: () => !!quotationData.customerInfo.customerName,
    },
    {
      title: "Quotation Items",
      component: (
        <ItemsStep
          items={quotationData.items}
          notes={quotationData.notes}
          onUpdate={(items, notes) => setQuotationData({ ...quotationData, items, notes })}
        />
      ),
      isValid: () => quotationData.items.length > 0,
    },
    {
      title: "Preview & Send",
      component: (
        <PreviewStep quotationData={quotationData} onSendEmail={handleSendEmail} onSendWhatsApp={handleSendWhatsApp} />
      ),
      isValid: () => true,
    },
  ]

  function generateQuotationNumber() {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `QT-${year}${month}-${random}`
  }

  function handleNext() {
    if (steps[currentStep].isValid()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    } else {
      toast({
        title: "Missing information",
        description: currentStep === 0 ? "Please enter customer name" : "Please add at least one item",
        variant: "destructive",
      })
    }
  }

  function handlePrevious() {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  async function handleSendEmail(email: string) {
    if (!email) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    toast({
      title: "Quotation sent",
      description: `Quotation has been sent to ${email}`,
    })
  }

  async function handleSendWhatsApp(phoneNumber: string) {
    if (!phoneNumber) {
      toast({
        title: "Missing phone number",
        description: "Please enter a WhatsApp number",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate sending to WhatsApp
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    // Format phone number and open WhatsApp
    const formattedNumber = phoneNumber.replace(/\D/g, "")
    const message = encodeURIComponent(`Here's your quotation ${quotationData.quotationNumber}`)
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank")

    toast({
      title: "WhatsApp opened",
      description: "Quotation message has been prepared for WhatsApp",
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Step indicator */}
      <div className="bg-muted p-4">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-sm hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-muted-foreground/30 w-full"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-primary transition-all"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h2>
        {steps[currentStep].component}
      </div>

      {/* Navigation buttons */}
      <div className="p-6 border-t flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSubmitting}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex flex-col sm:flex-row gap-4">
          {isSubmitting && (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={isSubmitting} className="w-full sm:w-auto">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
