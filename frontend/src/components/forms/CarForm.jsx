export default function CarForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    { key: 'make',           label: 'Make',            type: 'select', options: ['Suzuki', 'Toyota', 'Honda', 'Kia', 'Hyundai', 'Daihatsu', 'Mitsubishi', 'Nissan', 'Other'] },
    { key: 'model',          label: 'Model',           type: 'text',   placeholder: 'e.g. Corolla, Civic' },
    { key: 'year',           label: 'Year',            type: 'number', placeholder: 'e.g. 2021' },
    { key: 'engine',         label: 'Engine (cc)',     type: 'select', options: ['660cc', '800cc', '1000cc', '1300cc', '1500cc', '1600cc', '1800cc', '2000cc', '2500cc+'] },
    { key: 'transmission',   label: 'Transmission',   type: 'select', options: ['Manual', 'Automatic'] },
    { key: 'color',          label: 'Color',           type: 'text',   placeholder: 'e.g. White, Silver' },
    { key: 'kms',            label: 'KMs Driven',      type: 'text',   placeholder: 'e.g. 65000' },
    { key: 'fuel',           label: 'Fuel Type',       type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric'] },
    { key: 'registeredCity', label: 'Registered City', type: 'text',   placeholder: 'e.g. Attock' },
    { key: 'condition',      label: 'Condition',       type: 'select', options: ['Excellent', 'Good', 'Fair', 'For Parts'] },
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