export default function FashionForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    { key: 'type', label: 'Item Type', type: 'select', options: ['Shirt', 'Kurta', 'Shalwar Kameez', 'Pants', 'Dress', 'Shoes', 'Bag', 'Jewellery', 'Other'] },
    { key: 'gender', label: 'For', type: 'select', options: ['Men', 'Women', 'Kids', 'Unisex'] },
    { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] },
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Gul Ahmed, J.' },
    { key: 'condition', label: 'Condition', type: 'select', options: ['New with Tags', 'New', 'Like New', 'Good', 'Fair'] },
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