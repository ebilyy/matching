import type { components } from '@/api/schema'

type ColumnMapping = components['schemas']['ColumnMapping']

// Same limits the api enforces (PRD §6.1); checked here to fail before a 50 MB upload.
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
export const ACCEPTED_EXTENSIONS = ['.xlsx', '.csv'] as const

/** Message for a file the api would reject with 413 / 415, or `true`. */
export function checkUploadFile(file: File | null | undefined): true | string {
  if (!file) return 'Оберіть файл'
  const name = file.name.toLowerCase()
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return 'Підтримуються лише XLSX і CSV'
  }
  if (file.size > MAX_UPLOAD_BYTES) return 'Файл більший за 50 МБ'
  return true
}

/**
 * Minimal catalog mapping: the headers of the two required columns.
 * The full wizard that reads headers from the file comes in T35.
 */
export function catalogMapping(skuHeader: string, nameHeader: string): ColumnMapping {
  return {
    columns: [
      { header: skuHeader.trim(), role: 'sku' },
      { header: nameHeader.trim(), role: 'name' },
    ],
  }
}

/** multipart/form-data body of uploadCatalog: `column_mapping` travels as JSON text. */
export function catalogUploadForm(file: File, mapping: ColumnMapping): FormData {
  const form = new FormData()
  form.append('file', file)
  form.append('column_mapping', JSON.stringify(mapping))
  return form
}
