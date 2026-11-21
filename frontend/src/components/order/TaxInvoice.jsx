import { useEffect } from 'react'
import cn from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import { Icon } from '@/components/ui/Icon'

const GST_STATE_CODES = {
  odisha: '21',
  maharashtra: '27',
  delhi: '07',
  karnataka: '29',
  'uttar pradesh': '09',
  'west bengal': '19',
  'tamil nadu': '33',
  gujarat: '24',
  'andhra pradesh': '37',
  rajasthan: '08',
  telangana: '36',
  kerala: '32',
  'madhya pradesh': '23',
  bihar: '10',
  punjab: '03',
  haryana: '06',
  assam: '18',
  jharkhand: '20',
  chhattisgarh: '22',
  uttarakhand: '05',
  'himachal pradesh': '02',
  'jammu and kashmir': '01',
  goa: '30',
  chandigarh: '04',
}

/** Converts number to formal Indian Currency words e.g. "Rupees Six Hundred and Seventy Eight Only" */
export function numberToIndianWords(num) {
  const n = Math.round(Number(num) || 0)
  if (n === 0) return 'Rupees Zero Only'

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (val) => {
    let str = ''
    if (val > 19) {
      str += b[Math.floor(val / 10)] + (val % 10 ? ' ' + a[val % 10] : '')
    } else {
      str += a[val]
    }
    return str
  }

  let words = ''
  let crore = Math.floor(n / 10000000)
  let remainder = n % 10000000
  let lakh = Math.floor(remainder / 100000)
  remainder = remainder % 100000
  let thousand = Math.floor(remainder / 1000)
  remainder = remainder % 1000
  let hundred = Math.floor(remainder / 100)
  let units = remainder % 100

  if (crore) words += inWords(crore) + ' Crore '
  if (lakh) words += inWords(lakh) + ' Lakh '
  if (thousand) words += inWords(thousand) + ' Thousand '
  if (hundred) words += inWords(hundred) + ' Hundred '
  if (units) {
    if (words) words += 'and '
    words += inWords(units) + ' '
  }

  return `Rupees ${words.trim()} Only`
}

/** Formats a date into formal invoice standard e.g. "21 Nov 2026" */
function formatInvoiceDate(dateInput) {
  if (!dateInput) return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput).split('at')[0].trim()
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return String(dateInput)
  }
}

/**
 * Pure official Tax Invoice Component.
 * Formatted to exact A4 printable dimensions with genuine Indian retail GST standards.
 */
export function TaxInvoice({ tracking, className, id = 'printable-tax-invoice' }) {
  if (!tracking) return null

  const items = tracking.items || []
  const subtotal = Number(tracking.amounts?.subtotal) || 0
  const discount = Math.abs(Number(tracking.amounts?.discount) || 0)
  const shipping = Number(tracking.amounts?.shipping) || 0
  const total = Number(tracking.amounts?.total) || (subtotal - discount + shipping)

  const customerState = tracking.destination?.state?.toLowerCase().trim() || 'odisha'
  const isInterstate = customerState !== 'odisha'
  const stateCode = GST_STATE_CODES[customerState] || '21'

  // GST 18% inclusive arithmetic:
  // Taxable Base = Total / 1.18
  // Total GST = Total - Taxable Base
  const effectiveGoodsTotal = Math.max(0, subtotal - discount)
  const taxableGoods = Math.round((effectiveGoodsTotal / 1.18) * 100) / 100
  const gstAmount = Math.round((effectiveGoodsTotal - taxableGoods) * 100) / 100

  const cgst = isInterstate ? 0 : Math.round((gstAmount / 2) * 100) / 100
  const sgst = isInterstate ? 0 : Math.round((gstAmount / 2) * 100) / 100
  const igst = isInterstate ? gstAmount : 0

  const isPaid =
    tracking.payment?.status?.toLowerCase().includes('paid') ||
    tracking.payment?.method?.toLowerCase().includes('razorpay') ||
    tracking.payment?.method?.toLowerCase().includes('online') ||
    tracking.payment?.method?.toLowerCase().includes('prepaid')

  const invoiceNumber = `INV-2026-${tracking.orderId || '0000'}`
  const invoiceDate = formatInvoiceDate(tracking.placedAt || tracking.date)

  return (
    <article
      id={id}
      className={cn(
        'mx-auto w-full max-w-[840px] bg-white text-[#111111] font-sans text-xs leading-normal select-text print:max-w-none print:w-full print:p-0 print:m-0 print:shadow-none print:border-none',
        className,
      )}
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* ──────────────── INVOICE SHEET WRAPPER ──────────────── */}
      <div className="border border-neutral-300 p-6 sm:p-9 bg-white shadow-sm print:border-none print:p-0">
        {/* ────────── 1. HEADER (BRAND & INVOICE META) ────────── */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-neutral-800 pb-5">
          {/* Company Brand Information */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                RAHEMAN PERFUMES
              </span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C6D37]">
              Haute Parfumerie & Artisanal Atelier
            </p>
            <p className="text-[11px] text-neutral-600 leading-tight pt-1">
              Main Road, Kendrapara, Odisha — 754211, India
            </p>
            <p className="text-[11px] text-neutral-600">
              <span className="font-semibold text-neutral-800">GSTIN:</span> 21AAKPR1234F1Z5 &nbsp;|&nbsp;{' '}
              <span className="font-semibold text-neutral-800">State Code:</span> 21 (Odisha)
            </p>
            <p className="text-[11px] text-neutral-600">
              <span className="font-semibold text-neutral-800">Email:</span> support@rahemanperfumes.com &nbsp;|&nbsp;{' '}
              <span className="font-semibold text-neutral-800">Phone:</span> +91 82608 66878
            </p>
          </div>

          {/* Tax Invoice Details Box */}
          <div className="text-right sm:min-w-[210px]">
            <span className="inline-block rounded border-2 border-neutral-900 bg-neutral-900 px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white">
              TAX INVOICE
            </span>
            <div className="mt-2.5 space-y-1 text-[11px]">
              <p>
                <span className="text-neutral-500">Invoice No:</span>{' '}
                <span className="font-bold text-neutral-900 font-mono">{invoiceNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">Invoice Date:</span>{' '}
                <span className="font-semibold text-neutral-900">{invoiceDate}</span>
              </p>
              <p>
                <span className="text-neutral-500">Order ID:</span>{' '}
                <span className="font-bold text-neutral-900 font-mono">#{tracking.orderId}</span>
              </p>
              <p>
                <span className="text-neutral-500">Order Date:</span>{' '}
                <span className="font-semibold text-neutral-900">{invoiceDate}</span>
              </p>
              <p>
                <span className="text-neutral-500">Place of Supply:</span>{' '}
                <span className="font-semibold text-neutral-900">
                  {tracking.destination?.state || 'Odisha'} (Code: {stateCode})
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* ────────── 2. BILLED TO & SHIPPED TO ────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-neutral-300 py-4 text-[11px]">
          {/* Bill To */}
          <div className="rounded border border-neutral-200 bg-[#FAFAFA] p-3">
            <p className="font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1">
              Billed To (Buyer)
            </p>
            <p className="mt-2 text-sm font-bold text-neutral-900">
              {tracking.destination?.name || tracking.consignee || 'Valued Customer'}
            </p>
            <p className="mt-0.5 text-neutral-700 leading-relaxed">
              {tracking.destination?.line1}
              {tracking.destination?.line2 ? `, ${tracking.destination.line2}` : ''}
              {tracking.destination?.area ? `, ${tracking.destination.area}` : ''}
              <br />
              {tracking.destination?.city}
              {tracking.destination?.district ? `, ${tracking.destination.district}` : ''}
              <br />
              {tracking.destination?.state} — {tracking.destination?.pincode}
            </p>
            {tracking.destination?.phone && (
              <p className="mt-1.5 text-neutral-800 font-mono">
                <span className="font-semibold text-neutral-600">Mobile:</span> +91 {tracking.destination.phone}
              </p>
            )}
          </div>

          {/* Ship To & Payment Mode */}
          <div className="rounded border border-neutral-200 bg-[#FAFAFA] p-3 flex flex-col justify-between">
            <div>
              <p className="font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1">
                Shipped To (Consignee)
              </p>
              <p className="mt-2 text-sm font-bold text-neutral-900">
                {tracking.destination?.name || tracking.consignee || 'Valued Customer'}
              </p>
              <p className="mt-0.5 text-neutral-700 leading-relaxed">
                {tracking.destination?.line1}
                {tracking.destination?.city ? `, ${tracking.destination.city}` : ''}
                <br />
                {tracking.destination?.state} — {tracking.destination?.pincode}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-neutral-500">Payment: </span>
                <span className="font-bold text-neutral-900 capitalize">
                  {tracking.payment?.method || 'Online Payment'}
                </span>
              </div>
              <span
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300',
                )}
              >
                {isPaid ? 'PAID / COMPLETED' : 'CASH ON DELIVERY'}
              </span>
            </div>
          </div>
        </div>

        {/* ────────── 3. ITEMIZED PRODUCTS TABLE ────────── */}
        <div className="py-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-y-2 border-neutral-800 bg-[#F4EFE6]/60 text-neutral-900 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-2 text-center w-10">#</th>
                <th className="py-2.5 px-2 text-left">Description of Goods</th>
                <th className="py-2.5 px-2 text-center w-24">HSN/SAC</th>
                <th className="py-2.5 px-2 text-center w-14">Qty</th>
                <th className="py-2.5 px-2 text-right w-24">Rate (₹)</th>
                <th className="py-2.5 px-2 text-right w-24">Taxable (₹)</th>
                <th className="py-2.5 px-2 text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((item, idx) => {
                const itemQty = Number(item.qty) || 1
                const itemPrice = Number(item.price) || 0
                const itemLineTotal = itemPrice * itemQty
                const itemTaxable = Math.round((itemLineTotal / 1.18) * 100) / 100

                return (
                  <tr key={item.id || idx} className="page-break-inside-avoid">
                    <td className="py-3 px-2 text-center text-neutral-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-2 text-left">
                      <p className="font-bold text-neutral-900 text-xs">{item.name}</p>
                      <p className="text-[10px] text-neutral-600">
                        {item.volume || '50ml'} &nbsp;·&nbsp; Artisanal Extrait de Parfum
                      </p>
                      {item.meta && <p className="text-[10px] text-neutral-500 italic">{item.meta}</p>}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-neutral-600">33030000</td>
                    <td className="py-3 px-2 text-center font-bold font-mono text-neutral-900">{itemQty}</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-800">{formatPrice(itemPrice)}</td>
                    <td className="py-3 px-2 text-right font-mono text-neutral-800">{formatPrice(itemTaxable)}</td>
                    <td className="py-3 px-2 text-right font-bold font-mono text-neutral-900">
                      {formatPrice(itemLineTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ────────── 4. FINANCIAL TOTALS & TAX BREAKDOWN ────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t-2 border-neutral-800 pt-4 text-[11px] page-break-inside-avoid">
          {/* Left: Words, Terms & Stamp */}
          <div className="space-y-4">
            <div>
              <p className="text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                Invoice Amount in Words:
              </p>
              <p className="mt-1 font-bold text-neutral-900 text-xs italic">
                {numberToIndianWords(total)}
              </p>
            </div>

            {/* GST Summary Table */}
            <div className="rounded border border-neutral-200 bg-[#FAFAFA] p-2.5">
              <p className="font-bold uppercase tracking-wider text-neutral-800 text-[10px] mb-1.5">
                GST Tax Summary (18% Included)
              </p>
              <div className="space-y-1 text-[10.5px]">
                {!isInterstate ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Central GST (CGST 9%):</span>
                      <span className="font-mono font-medium text-neutral-900">{formatPrice(cgst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">State GST (SGST 9%):</span>
                      <span className="font-mono font-medium text-neutral-900">{formatPrice(sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Integrated GST (IGST 18%):</span>
                    <span className="font-mono font-medium text-neutral-900">{formatPrice(igst)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-1 font-semibold">
                  <span className="text-neutral-700">Total Tax Amount:</span>
                  <span className="font-mono text-neutral-900">{formatPrice(gstAmount)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Declaration */}
            <div className="text-[10px] text-neutral-500 leading-relaxed space-y-1">
              <p className="font-semibold text-neutral-700">Declaration:</p>
              <p>
                1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </p>
              <p>
                2. Fragrances are sealed in tamper-proof atelier packaging. No returns accepted once delivered.
              </p>
            </div>
          </div>

          {/* Right: Calculations & Grand Total */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2 border-b border-neutral-300 pb-3">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon / Offer Discount:</span>
                  <span className="font-mono">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping & Handling:</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {shipping === 0 ? 'COMPLIMENTARY' : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm sm:text-base font-bold text-neutral-900">
                <span>Grand Total (INR):</span>
                <span className="font-mono text-base sm:text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Official Signature & Atelier Seal */}
            <div className="pt-4 flex items-end justify-between">
              {/* Circular Atelier Seal representation */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#8C6D37] p-1 text-center text-[#8C6D37] opacity-85">
                <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-[#8C6D37] text-[7.5px] font-bold uppercase leading-tight">
                  RAHEMAN
                  <br />
                  SEALED
                  <br />
                  ATELIER
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                  For RAHEMAN PERFUMES
                </p>
                <div className="h-8 flex items-end justify-end">
                  <span className="font-serif italic text-base text-neutral-800 font-medium tracking-wide">
                    Authorized Signatory
                  </span>
                </div>
                <p className="text-[9px] text-neutral-400">Computer Generated Document</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Interactive Modal for viewing and printing the Tax Invoice.
 */
export function TaxInvoiceModal({ tracking, open, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !tracking) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-6 backdrop-blur-sm print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-[890px] rounded-2xl bg-neutral-100 shadow-2xl print:max-h-none print:shadow-none print:rounded-none print:bg-white">
        {/* Floating Top Control Bar (Hidden when printing) */}
        <div className="no-print flex shrink-0 items-center justify-between border-b border-neutral-300 bg-white px-5 py-3.5 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <Icon name="file-text" className="h-5 w-5 text-brand-goldDark" />
            <h2 className="text-sm font-bold text-neutral-900">
              Tax Invoice — Order #{tracking.orderId}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-charcoal px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-goldDark active:scale-95"
            >
              <Icon name="printer" className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice preview"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Icon name="close" className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0 print:overflow-visible">
          <TaxInvoice tracking={tracking} />
        </div>
      </div>
    </div>
  )
}

export default TaxInvoice
