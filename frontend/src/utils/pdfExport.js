/**
 * PDF Export Utility
 *
 * Exporteer omgevingsplan data naar PDF
 */

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

/**
 * Export planning data to PDF
 */
export function exportPlanningDataToPDF(location, planningData, regulations) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Omgevingsplan Rapportage', 14, 22)

  // Location info
  doc.setFontSize(12)
  doc.text('Locatie:', 14, 35)
  doc.setFontSize(10)
  doc.text(location.display_name, 14, 42)
  doc.text(`Coördinaten: ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`, 14, 48)
  doc.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 14, 54)

  let yPosition = 65

  // Documents section
  if (planningData && planningData.documents && planningData.documents.length > 0) {
    doc.setFontSize(14)
    doc.text('Omgevingsdocumenten', 14, yPosition)
    yPosition += 8

    planningData.documents.forEach((docItem, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(`${index + 1}. ${docItem.title}`, 14, yPosition)
      yPosition += 6

      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')

      if (docItem.type) {
        doc.text(`Type: ${docItem.type}`, 20, yPosition)
        yPosition += 5
      }

      if (docItem.status) {
        doc.text(`Status: ${docItem.status}`, 20, yPosition)
        yPosition += 5
      }

      if (docItem.bevoegdGezag) {
        doc.text(`Bevoegd gezag: ${docItem.bevoegdGezag}`, 20, yPosition)
        yPosition += 5
      }

      if (docItem.geldigVanaf) {
        doc.text(`Geldig vanaf: ${formatDate(docItem.geldigVanaf)}`, 20, yPosition)
        yPosition += 5
      }

      yPosition += 3
    })
  }

  // Regulations section
  if (regulations && regulations.regulations && regulations.regulations.length > 0) {
    if (yPosition > 240) {
      doc.addPage()
      yPosition = 20
    }

    yPosition += 10
    doc.setFontSize(14)
    doc.text('Voorschriften & Annotaties', 14, yPosition)
    yPosition += 8

    // Create table data
    const tableData = []

    regulations.regulations.forEach(reg => {
      const type = reg.type === 'annotatie' ? 'Annotatie' : 'Voorschrift'
      const naam = reg.naam || reg.omschrijving || '-'
      const waarde = reg.waarde ? `${reg.waarde} ${reg.eenheid || ''}` : '-'
      const plan = reg.planTitle || '-'

      tableData.push([type, naam, waarde, plan])
    })

    doc.autoTable({
      startY: yPosition,
      head: [['Type', 'Naam', 'Waarde', 'Plan']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14, right: 14 }
    })
  }

  // Categories summary
  if (regulations && regulations.categories) {
    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : yPosition + 10

    if (yPosition > 260) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(12)
    doc.text('Samenvatting per categorie:', 14, yPosition)
    yPosition += 6

    doc.setFontSize(9)
    Object.keys(regulations.categories).forEach(category => {
      const count = regulations.categories[category].length
      if (count > 0) {
        doc.text(`${getCategoryLabel(category)}: ${count} items`, 20, yPosition)
        yPosition += 5
      }
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128)
    doc.text(
      `Pagina ${i} van ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Save PDF
  const filename = `omgevingsplan_${location.city}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL')
  } catch {
    return dateString
  }
}

/**
 * Get category label
 */
function getCategoryLabel(category) {
  const labels = {
    bouwen: 'Bouwen',
    milieu: 'Milieu',
    gebruik: 'Gebruik',
    overig: 'Overig'
  }
  return labels[category] || category
}
