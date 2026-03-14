export default function PropertyForRentForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    {
      key: 'type', label: 'Property Type', type: 'select',
      options: ['House', 'Apartment & Flat', 'Room', 'Shop', 'Office', 'Commercial Space', 'Warehouse', 'Other'],
    },
    {
      key: 'areaSize', label: 'Area Size', type: 'text',
      placeholder: 'e.g. 5 Marla, 200 sqft',
    },
    {
      key: 'areaUnit', label: 'Area Unit', type: 'select',
      options: ['Marla', 'Kanal', 'Square Feet', 'Square Yards'],
    },
    {
      key: 'bedrooms', label: 'Bedrooms', type: 'select',
      options: ['Studio', '1', '2', '3', '4', '5', '6+', 'N/A'],
    },
    {
      key: 'bathrooms', label: 'Bathrooms', type: 'select',
      options: ['1', '2', '3', '4', '5+', 'N/A'],
    },
    {
      key: 'furnishing', label: 'Furnishing', type: 'select',
      options: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    },
    {
      key: 'floor', label: 'Floor', type: 'text',
      placeholder: 'e.g. Ground, 1st, 2nd',
    },
    {
      key: 'rentPer', label: 'Rent Per', type: 'select',
      options: ['Monthly', 'Yearly'],
    },
    {
      key: 'availability', label: 'Available From', type: 'text',
      placeholder: 'e.g. Immediately, Jan 2025',
    },
    {
      key: 'condition', label: 'Condition', type: 'select',
      options: ['Excellent', 'Good', 'Fair'],
    },
  ]

  return (
    <div className='form-grid-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {fields.map(f => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            {f.label}
          </label>
          {f.type === 'select' ? (
            <select value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)} className="input-field">
              <option value="">Select {f.label}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input type="text" value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder} className="input-field" />
          )}
        </div>
      ))}
    </div>
  )
}