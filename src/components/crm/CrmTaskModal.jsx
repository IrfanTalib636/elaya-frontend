import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../ui'
import { createCrmTask } from '../../api/crm'
import { CRM_TASK_TYPEN, CRM_TASK_PRIORITAET, defaultDueDate } from '../../constants/crm'

const CrmTaskModal = ({ customer, customers = [], onClose, onSaved }) => {
  const [titel, setTitel] = useState('')
  const [customerId, setCustomerId] = useState(customer?.id ?? '')
  const [typ, setTyp] = useState('followup')
  const [prioritaet, setPrioritaet] = useState('mittel')
  const [faelligAm, setFaelligAm] = useState(defaultDueDate())
  const [saving, setSaving] = useState(false)

  const customerLabel = customer
    ? `${customer.vorname} ${customer.nachname}`
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titel.trim()) {
      toast.error('Bitte Titel eingeben.')
      return
    }
    setSaving(true)
    try {
      await createCrmTask({
        customer_id: customerId || null,
        titel: titel.trim(),
        typ,
        prioritaet,
        faellig_am: faelligAm,
      })
      toast.success('Aufgabe erstellt.')
      onSaved?.()
      onClose()
    } catch {
      toast.error('Aufgabe konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={customerLabel ? `Aufgabe · ${customerLabel}` : 'Neue Aufgabe'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!customer && (
          <Select
            label="Kunde (optional)"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Allgemein (Studio-weit)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.vorname} {c.nachname}
              </option>
            ))}
          </Select>
        )}

        <Input
          label="Titel"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="z.B. Follow-up nach Beratung"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Typ" value={typ} onChange={(e) => setTyp(e.target.value)}>
            {CRM_TASK_TYPEN.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Select label="Priorität" value={prioritaet} onChange={(e) => setPrioritaet(e.target.value)}>
            {CRM_TASK_PRIORITAET.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>

        <Input
          label="Fällig am"
          type="date"
          value={faelligAm}
          onChange={(e) => setFaelligAm(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" loading={saving}>Speichern</Button>
        </div>
      </form>
    </Modal>
  )
}

export default CrmTaskModal
