export default function OthersForm({ data = {}, onChange }) {
  const update = (key, val) => onChange({ ...data, [key]: val })

  const fields = [
    { key: 'type', label: 'Item Type', type: 'select', options: ['Sports Equipment', 'Books', 'Musical Instrument', 'Agriculture', 'Pets & Animals', 'Kids Items', 'Other'] },
    { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Good', 'Fair'] },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {fields.map(f => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            {f.label}
          </label>
          <select value={data[f.key] || ''} onChange={e => update(f.key, e.target.value)} className="input-field">
            <option value="">Select {f.label}</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}