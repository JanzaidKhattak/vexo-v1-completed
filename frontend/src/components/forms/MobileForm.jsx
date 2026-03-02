export default function MobileForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Samsung', 'Apple', 'Oppo', 'Vivo', 'Realme', 'Tecno', 'Infinix', 'Nokia', 'Other'] },
    { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Galaxy A54' },
    { key: 'storage', label: 'Storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] },
    { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair', 'For Parts'] },
    { key: 'warranty', label: 'Warranty', type: 'select', options: ['No Warranty', '1 Month', '3 Months', '6 Months', '1 Year'] },
    { key: 'pta', label: 'PTA Status', type: 'select', options: ['PTA Approved', 'Non-PTA', 'Unknown'] },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {fields.map(f => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            {f.label}
          </label>
          {f.type === 'select' ? (
            <select value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)} className="input-field">
              <option value="">Select {f.label}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input type="text" value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} className="input-field" />
          )}
        </div>
      ))}
    </div>
  )
}