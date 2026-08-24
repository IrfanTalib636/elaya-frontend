import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal, Button, Input, Select } from '../ui'
import { createCrmTask } from '../../api/crm'
import { CRM_TASK_TYPEN, CRM_TASK_PRIORITAET, defaultDueDate } from '../../constants/crm'
import useContent from '../../i18n/useContent'

const CrmTaskModal = ({ customer, customers = [], onClose, onSaved }) => {
  const { t } = useContent()
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
      toast.error(t('crmModals.titleRequired'))
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
      toast.success(t('crmModals.taskCreated'))
      onSaved?.()
      onClose()
    } catch {
      toast.error(t('crmModals.taskSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={
        customerLabel
          ? t('crmModals.taskWithCustomer', { name: customerLabel })
          : t('crmModals.newTask')
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!customer && (
          <Select
            label={t('crmModals.customerOptional')}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">{t('crmModals.studioWide')}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.vorname} {c.nachname}
              </option>
            ))}
          </Select>
        )}

        <Input
          label={t('crmModals.title')}
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder={t('crmModals.titlePlaceholder')}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label={t('crmModals.noteType')} value={typ} onChange={(e) => setTyp(e.target.value)}>
            {CRM_TASK_TYPEN.map((item) => (
              <option key={item.value} value={item.value}>{t(`crm.taskTypes.${item.value}`)}</option>
            ))}
          </Select>
          <Select label={t('crmModals.taskPriority')} value={prioritaet} onChange={(e) => setPrioritaet(e.target.value)}>
            {CRM_TASK_PRIORITAET.map((item) => (
              <option key={item.value} value={item.value}>{t(`crm.priorities.${item.value}`)}</option>
            ))}
          </Select>
        </div>

        <Input
          label={t('crmModals.taskDue')}
          type="date"
          value={faelligAm}
          onChange={(e) => setFaelligAm(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('crmModals.cancel')}</Button>
          <Button type="submit" loading={saving}>{t('crmModals.save')}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default CrmTaskModal
