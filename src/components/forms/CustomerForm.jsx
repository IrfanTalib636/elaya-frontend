import { useState } from 'react'
import { Input, Select, Button } from '../ui'

const INITIAL = {
  vorname: '', nachname: '', email: '', telefon: '',
  geburtsdatum: '', strasse: '', plz: '', ort: '', land: 'Schweiz', notizen: '',
}

const CustomerForm = ({ onSubmit, loading, onCancel }) => {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.vorname.trim())  errs.vorname  = 'Pflichtfeld'
    if (!form.nachname.trim()) errs.nachname = 'Pflichtfeld'
    if (!form.email.trim())    errs.email    = 'Pflichtfeld'
    if (!form.telefon.trim())  errs.telefon  = 'Pflichtfeld'
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
          label="Vorname"
          value={form.vorname}
          onChange={set('vorname')}
          error={errors.vorname}
          placeholder="Sofia"
          autoFocus
        />
        <Input
          label="Nachname"
          value={form.nachname}
          onChange={set('nachname')}
          error={errors.nachname}
          placeholder="Muster"
        />
      </div>

      <Input
        label="E-Mail"
        type="email"
        value={form.email}
        onChange={set('email')}
        error={errors.email}
        placeholder="sofia@example.com"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Telefon"
          type="tel"
          value={form.telefon}
          onChange={set('telefon')}
          error={errors.telefon}
          placeholder="+41 79 000 00 00"
        />
        <Input
          label="Geburtsdatum"
          type="date"
          value={form.geburtsdatum}
          onChange={set('geburtsdatum')}
        />
      </div>

      <Input
        label="Strasse"
        value={form.strasse}
        onChange={set('strasse')}
        placeholder="Musterstrasse 1"
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="PLZ"
          value={form.plz}
          onChange={set('plz')}
          placeholder="8001"
        />
        <div className="col-span-2">
          <Input
            label="Ort"
            value={form.ort}
            onChange={set('ort')}
            placeholder="Zürich"
          />
        </div>
      </div>

      <Select label="Land" value={form.land} onChange={set('land')}>
        <option>Schweiz</option>
        <option>Deutschland</option>
        <option>Österreich</option>
        <option>Frankreich</option>
        <option>Italien</option>
        <option>Anderes</option>
      </Select>

      <Input
        label="Notizen (intern)"
        value={form.notizen}
        onChange={set('notizen')}
        placeholder="Interne Anmerkungen…"
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-elaya-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Abbrechen
        </Button>
        <Button type="submit" loading={loading}>
          Kunden anlegen
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm
