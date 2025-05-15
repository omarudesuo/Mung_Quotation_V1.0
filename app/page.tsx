import { QuotationForm } from "@/components/quotation-form"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">Mung Quotation V 1.0</h1>
      <QuotationForm />
    </main>
  )
}
