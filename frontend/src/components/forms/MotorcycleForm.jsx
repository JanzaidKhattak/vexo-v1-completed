export default function MotorcycleForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    { key: 'brand',     label: 'Brand',        type: 'select', options: ['Honda', 'Yamaha', 'Suzuki', 'United', 'Ravi', 'Road Prince', 'Super Power', 'Other'] },
    { key: 'model',     label: 'Model',        type: 'text',   placeholder: 'e.g. CD 70, CG 125' },
    { key: 'year',      label: 'Year',         type: 'number', placeholder: 'e.g. 2022' },
    { key: 'cc',        label: 'Engine (CC)',  type: 'select', options: ['70cc', '100cc', '125cc', '150cc', '200cc', '250cc+'] },
    { key: 'kms',       label: 'KMs Driven',   type: 'text',   placeholder: 'e.g. 15000' },
    { key: 'condition', label: 'Condition',    type: 'select', options: ['New', 'Like New', 'Good', 'Fair', 'For Parts'] },
  ]

  return (
    <div className='form-grid-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {fields.map(f => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            {f.label}
          </label>

          {f.type === 'select' ? (
            <select
              value={data[f.key] || ''}
              onChange={e => update(f.key, e.target.value)}
              className="input-field"
            >
              <option value="">Select {f.label}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

          ) : f.type === 'number' ? (
            <input
              type="text"
              inputMode="numeric"
              value={data[f.key] || ''}
              onChange={e => {
                // only allow digits, max 4 chars
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                update(f.key, val)
              }}
              placeholder={f.placeholder}
              className="input-field"
            />

          ) : (
            <input
              type="text"
              value={data[f.key] || ''}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="input-field"
            />
          )}
        </div>
      ))}
    </div>
  )
}