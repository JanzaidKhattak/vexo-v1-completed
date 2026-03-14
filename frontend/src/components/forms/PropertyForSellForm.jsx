export default function PropertyForSellForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    {
      key: 'type', label: 'Property Type', type: 'select',
      options: ['Land & Plot', 'House', 'Apartment & Flat', 'Shop', 'Office', 'Commercial Space', 'Farm House', 'Other'],
    },
    {
      key: 'areaSize', label: 'Area Size', type: 'text',
      placeholder: 'e.g. 5 Marla, 1 Kanal, 200 sqft',
    },
    {
      key: 'areaUnit', label: 'Area Unit', type: 'select',
      options: ['Marla', 'Kanal', 'Square Feet', 'Square Yards', 'Acres'],
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
      key: 'condition', label: 'Condition', type: 'select',
      options: ['New / Under Construction', 'Ready to Move', 'Old'],
    },
    {
      key: 'furnishing', label: 'Furnishing', type: 'select',
      options: ['Furnished', 'Semi-Furnished', 'Unfurnished', 'N/A'],
    },
    {
      key: 'floor', label: 'Floor Number', type: 'text',
      placeholder: 'e.g. Ground, 1st, 2nd',
    },
    {
      key: 'facing', label: 'Facing', type: 'select',
      options: ['East', 'West', 'North', 'South', 'Corner', 'N/A'],
    },
    {
      key: 'possession', label: 'Possession', type: 'select',
      options: ['Immediate', '1-3 Months', '3-6 Months', '6-12 Months', 'After 1 Year'],
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