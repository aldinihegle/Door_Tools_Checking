export function formatRupiah(value) {
  if (typeof value !== 'number') value = Number(value) || 0
  return 'Rp ' + value.toLocaleString('id-ID')
} 