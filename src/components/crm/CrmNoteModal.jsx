import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../ui'
import { createCrmNote } from '../../api/crm'
import {
  CRM_NOTE_TYPEN,
  CRM_TASK_TYPEN,
  CRM_TASK_PRIORITAET,
  defaultDueDate,
} from '../../constants/crm'

const CrmNoteModal = ({ customer, onClose, onSaved }) => {
  const [typ, setTyp] = useState('anruf')
  const [inhalt, setInhalt] = useState('')
  const [createTask, setCreateTask] = useState(false)
  const [taskTitel, setTaskTitel] = useState('')
  const [taskTyp, setTaskTyp] = useState('followup')
  const [taskPrio, setTaskPrio] = useState('mittel')
  const [taskDue, setTaskDue] = useState(defaultDueDate())
  const [saving, setSaving] = useState(false)

  const name = `${customer.vorname} ${customer.nachname}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inhalt.trim()) {
      toast.error('Bitte Notiz eingeben.')
      return
    }
    if (createTask && !taskTitel.trim()) {
      toast.error('Bitte Aufgaben-Titel eingeben.')
      return
    }

    setSaving(true)
    try {
      const body = {
        customer_id: customer.id,
        typ,
        inhalt: inhalt.trim(),
      }
      if (createTask && taskTitel.trim()) {
        body.aufgabe = {
          titel: taskTitel.trim(),
          typ: taskTyp,
          prioritaet: taskPrio,
          faellig_am: taskDue,
        }
      }
      await createCrmNote(body)
      toast.success('Notiz gespeichert.')
      onSaved?.()
      onClose()
    } catch {
      toast.error('Notiz konnte nicht gespeichert werden.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`CRM-Notiz · ${name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label="Typ" value={typ} onChange={(e) => setTyp(e.target.value)}>
          {CRM_NOTE_TYPEN.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>

        <div>
          <label className="block text-[11px] font-semibold text-studio-w2 uppercase tracking-wider mb-1.5">
            Inhalt
          </label>
          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            rows={4}
            placeholder="Gespräch, E-Mail, Ergebnis…"
            className="w-full px-3 py-2.5 rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-4 text-studio-white text-[13px] outline-none focus:border-studio-gold transition-colors placeholder:text-studio-w3 resize-y min-h-[100px]"
          />
        </div>

        <label className="flex items-center gap-2 text-[12px] text-studio-w1 cursor-pointer">
          <input
            type="checkbox"
            checked={createTask}
            onChange={(e) => setCreateTask(e.target.checked)}
            className="accent-studio-gold"
          />
          Follow-up-Aufgabe erstellen
        </label>

        {createTask && (
          <div className="flex flex-col gap-3 pl-1 border-l-2 border-studio-gold/30 ml-1">
            <Input
              label="Aufgaben-Titel"
              value={taskTitel}
              onChange={(e) => setTaskTitel(e.target.value)}
              placeholder="z.B. Erneut anrufen"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Aufgaben-Typ" value={taskTyp} onChange={(e) => setTaskTyp(e.target.value)}>
                {CRM_TASK_TYPEN.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Select label="Priorität" value={taskPrio} onChange={(e) => setTaskPrio(e.target.value)}>
                {CRM_TASK_PRIORITAET.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <Input
              label="Fällig am"
              type="date"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button type="submit" loading={saving}>Speichern</Button>
        </div>
      </form>
    </Modal>
  )
}

export default CrmNoteModal
