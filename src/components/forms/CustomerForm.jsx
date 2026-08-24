import { useState } from 'react'
import { Input, Select, Button } from '../ui'
import useContent from '../../i18n/useContent'

const COUNTRY_VALUES = ['Schweiz', 'Deutschland', 'Österreich', 'Frankreich', 'Italien', 'Anderes']

const INITIAL = {
  vorname: '', nachname: '', email: '', telefon: '',
  geburtsdatum: '', strasse: '', plz: '', ort: '', land: 'Schweiz', notizen: '',
}

const CustomerForm = ({ onSubmit, loading, onCancel }) => {
  const { components } = useContent()
  const copy = components.customerForm

  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.vorname.trim())  errs.vorname  = copy.required
    if (!form.nachname.trim()) errs.nachname = copy.required
    if (!form.email.trim())    errs.email    = copy.required
    if (!form.telefon.trim())  errs.telefon  = copy.required
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" translate="no">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={copy.firstName}
          value={form.vorname}
          onChange={set('vorname')}
          error={errors.vorname}
          placeholder="Sofia"
          autoFocus
        />
        <Input
          label={copy.lastName}
          value={form.nachname}
          onChange={set('nachname')}
          error={errors.nachname}
          placeholder="Muster"
        />
      </div>

      <Input
        label={copy.email}
        type="email"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        placeholder="sofia@example.com"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={copy.phone}
          type="tel"
          value={form.telefon}
          onChange={set('telefon')}
          error={errors.telefon}
          placeholder="+41 79 000 00 00"
        />
        <Input
          label={copy.birthDate}
          type="date"
          value={form.geburtsdatum}
          onChange={set('geburtsdatum')}
        />
      </div>

      <Input
        label={copy.street}
        value={form.strasse}
        onChange={set('strasse')}
        placeholder="Musterstrasse 1"
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label={copy.postalCode}
          value={form.plz}
          onChange={set('plz')}
          placeholder="8001"
        />
        <div className="col-span-2">
          <Input
            label={copy.city}
            value={form.ort}
            onChange={set('ort')}
            placeholder="Zürich"
          />
        </div>
      </div>

      <Select label={copy.country} value={form.land} onChange={set('land')}>
        {COUNTRY_VALUES.map((c) => (
          <option key={c} value={c}>{copy.countries[c] ?? c}</option>
        ))}
      </Select>

      <Input
        label={copy.notes}
        value={form.notizen}
        onChange={set('notizen')}
        placeholder={copy.notesPh}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {copy.cancel}
        </Button>
        <Button type="submit" loading={loading}>
          {copy.submit}
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm
