import React from 'react'

interface OdontogramProps {
  selectedTeeth: string[]
  onChange: (teeth: string[]) => void
  readOnly?: boolean
}

export const Odontogram: React.FC<OdontogramProps> = ({ selectedTeeth, onChange, readOnly = false }) => {
  // Adult Permanent Teeth (FDI System)
  const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11']
  const upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28']
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41']
  const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38']

  const toggleTooth = (tooth: string) => {
    if (readOnly) return
    if (selectedTeeth.includes(tooth)) {
      onChange(selectedTeeth.filter((t) => t !== tooth))
    } else {
      onChange([...selectedTeeth, tooth].sort())
    }
  }

  const renderTooth = (tooth: string) => {
    const isSelected = selectedTeeth.includes(tooth)
    return (
      <button
        key={tooth}
        type="button"
        onClick={() => toggleTooth(tooth)}
        disabled={readOnly}
        className={`tooth-btn ${isSelected ? 'selected' : ''}`}
        title={`Gigi ${tooth}`}
      >
        <span style={{ fontSize: '10px', opacity: 0.7 }}>#{tooth}</span>
        <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C8 2 5 6 5 11c0 5 3 11 5 11 1.5 0 2-4 2-4s.5 4 2 4c2 0 5-6 5-11 0-5-3-9-7-9z" />
        </svg>
      </button>
    )
  }

  return (
    <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Odontogram (Pilih Elemen Gigi Pasien)</span>
          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
            {selectedTeeth.length > 0 ? `${selectedTeeth.length} Gigi Terpilih: ${selectedTeeth.join(', ')}` : 'Belum ada gigi dipilih'}
          </span>
        </div>

        {/* Rahang Atas (Maxilla) */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '6px', fontWeight: 600 }}>
            RAHANG ATAS (MAXILLA)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>{upperRight.map(renderTooth)}</div>
            <div style={{ width: '2px', background: 'var(--border-light)', borderRadius: '2px' }} />
            <div style={{ display: 'flex', gap: '4px' }}>{upperLeft.map(renderTooth)}</div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 0' }} />

        {/* Rahang Bawah (Mandibula) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>{lowerRight.map(renderTooth)}</div>
            <div style={{ width: '2px', background: 'var(--border-light)', borderRadius: '2px' }} />
            <div style={{ display: 'flex', gap: '4px' }}>{lowerLeft.map(renderTooth)}</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
            RAHANG BAWAH (MANDIBULA)
          </div>
        </div>
      </div>
    </div>
  )
}
