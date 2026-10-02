import { describe, expect, it } from 'vitest'

import {
  catalogMapping,
  catalogUploadForm,
  checkUploadFile,
  MAX_UPLOAD_BYTES,
} from '../catalogUpload'

const fileOf = (name: string, size = 10) =>
  new File([new Uint8Array(size)], name, { type: 'application/octet-stream' })

describe('checkUploadFile', () => {
  it('accepts XLSX and CSV regardless of case', () => {
    expect(checkUploadFile(fileOf('catalog.XLSX'))).toBe(true)
    expect(checkUploadFile(fileOf('каталог.csv'))).toBe(true)
  })

  it('rejects other types, missing and oversized files', () => {
    expect(checkUploadFile(fileOf('notes.txt'))).toBe('Підтримуються лише XLSX і CSV')
    expect(checkUploadFile(null)).toBe('Оберіть файл')
    const big = fileOf('big.csv')
    Object.defineProperty(big, 'size', { value: MAX_UPLOAD_BYTES + 1 })
    expect(checkUploadFile(big)).toBe('Файл більший за 50 МБ')
  })
})

describe('catalogUploadForm', () => {
  it('sends the file and the mapping as JSON text', () => {
    const file = fileOf('c.csv')
    const form = catalogUploadForm(file, catalogMapping(' Артикул ', 'Назва'))

    expect(form.get('file')).toBeInstanceOf(File)
    expect(JSON.parse(form.get('column_mapping') as string)).toEqual({
      columns: [
        { header: 'Артикул', role: 'sku' },
        { header: 'Назва', role: 'name' },
      ],
    })
  })
})
