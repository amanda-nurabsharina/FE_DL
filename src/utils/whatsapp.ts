// WhatsApp Link Generator Utility

export function formatPhoneForWA(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  }
  return cleaned
}

export function openWhatsApp(phone: string, text: string) {
  const formatted = formatPhoneForWA(phone)
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export function generateWAMessage(
  type: 'ORDER_INTAKE' | 'COMPLETED' | 'DELIVERY',
  doctorName: string,
  patientName: string,
  dentureType: string,
  orderNumber: string,
  extra = ''
): string {
  switch (type) {
    case 'ORDER_INTAKE':
      return `Halo Dokter ${doctorName},\n\nPesanan gigi tiruan atas nama pasien: *${patientName}* (${dentureType}) telah kami terima di Dental Lab dengan nomor SPK: *${orderNumber}*.\nEstimasi selesai: ${extra}.\n\nTerima kasih atas kepercayaannya!`
    case 'COMPLETED':
      return `Halo Dokter ${doctorName},\n\nPesanan gigi tiruan pasien: *${patientName}* (${dentureType}) dengan nomor SPK: *${orderNumber}* telah lolos QC dan *SELESAI DIPRODUKSI*.\nTotal Biaya: ${extra}.\n\nKami sedang menyiapkan kemasan dan pengiriman. Terima kasih!`
    case 'DELIVERY':
      return `Halo Dokter ${doctorName},\n\nPaket gigi tiruan pasien *${patientName}* (SPK: *${orderNumber}*) sedang dalam proses *PENGIRIMAN* ke klinik hari ini. Kurir/Resi: ${extra}.\n\nMohon konfirmasi jika paket telah diterima. Terima kasih!`
    default:
      return ''
  }
}
