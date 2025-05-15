import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

export async function generateQuotationPDF(quotationElement: HTMLElement, quotationNumber: string): Promise<void> {
  // Create a clone of the quotation element to avoid modifying the original
  const clone = quotationElement.cloneNode(true) as HTMLElement
  document.body.appendChild(clone)

  // Set fixed dimensions for consistent output
  clone.style.width = "794px" // A4 width in pixels at 96 DPI
  clone.style.padding = "40px"
  clone.style.position = "absolute"
  clone.style.left = "-9999px"
  clone.style.top = "-9999px"
  clone.style.backgroundColor = "white"

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

export function generateQuotationWord(quotationElement: HTMLElement, quotationNumber: string): void {
  // Create a clone of the quotation element
  const clone = quotationElement.cloneNode(true) as HTMLElement

  // Get the HTML content
  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation ${quotationNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: "application/msword" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `Quotation-${quotationNumber}.doc`
  link.click()
}
