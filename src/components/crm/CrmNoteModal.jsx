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
import useContent from '../../i18n/useContent'

const CrmNoteModal = ({ customer, onClose, onSaved }) => {
  const { t } = useContent()
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
      toast.error(t('crmModals.noteRequired'))
      return
    }
    if (createTask && !taskTitel.trim()) {
      toast.error(t('crmModals.taskTitleRequired'))
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
      toast.success(t('crmModals.noteSaved'))
      onSaved?.()
      onClose()
    } catch {
      toast.error(t('crmModals.noteSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={t('crmModals.noteTitle', { name })} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select label={t('crmModals.noteType')} value={typ} onChange={(e) => setTyp(e.target.value)}>
          {CRM_NOTE_TYPEN.map((item) => (
            <option key={item.value} value={item.value}>{t(`crm.noteTypes.${item.value}`)}</option>
          ))}
        </Select>

        <div>
          <label className="block text-[11px] font-semibold text-studio-w2 uppercase tracking-wider mb-1.5">
            {t('crmModals.noteContentLabel')}
          </label>
          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            rows={4}
            placeholder={t('crmModals.noteContentPlaceholder')}
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
          {t('crmModals.createFollowUpTask')}
        </label>

        {createTask && (
          <div className="flex flex-col gap-3 pl-1 border-l-2 border-studio-gold/30 ml-1">
            <Input
              label={t('crmModals.taskTitle')}
              value={taskTitel}
              onChange={(e) => setTaskTitel(e.target.value)}
              placeholder={t('crmModals.taskTitlePlaceholder')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select label={t('crmModals.taskTypeLabel')} value={taskTyp} onChange={(e) => setTaskTyp(e.target.value)}>
                {CRM_TASK_TYPEN.map((item) => (
                  <option key={item.value} value={item.value}>{t(`crm.taskTypes.${item.value}`)}</option>
                ))}
              </Select>
              <Select label={t('crmModals.taskPriority')} value={taskPrio} onChange={(e) => setTaskPrio(e.target.value)}>
                {CRM_TASK_PRIORITAET.map((item) => (
                  <option key={item.value} value={item.value}>{t(`crm.priorities.${item.value}`)}</option>
                ))}
              </Select>
            </div>
            <Input
              label={t('crmModals.taskDue')}
              type="date"
              value={taskDue}
              onChange={(e) => setTaskDue(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('crmModals.cancel')}</Button>
          <Button type="submit" loading={saving}>{t('crmModals.save')}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default CrmNoteModal
