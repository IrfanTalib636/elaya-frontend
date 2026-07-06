import { useMemo } from 'react'
import { Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, Button, EmptyState } from '../ui'
import { updateCrmTask, deleteCrmTask } from '../../api/crm'
import { PRIORITY_ICON, fmtCrmDate, startOfDay } from '../../constants/crm'

const TaskRow = ({ task, onChange }) => {
  const heute = startOfDay()
  const faellig = startOfDay(new Date(task.faellig_am))
  const overdue = !task.erledigt && faellig < heute

  const complete = async () => {
    try {
      await updateCrmTask(task.id, { erledigt: true })
      toast.success('Erledigt.')
      onChange()
    } catch {
      toast.error('Konnte nicht aktualisiert werden.')
    }
  }

  const remove = async () => {
    try {
      await deleteCrmTask(task.id)
      toast.success('Aufgabe gelöscht.')
      onChange()
    } catch {
      toast.error('Konnte nicht gelöscht werden.')
    }
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] border mb-1.5
        ${overdue ? 'border-studio-red/30 bg-studio-red/5' : 'border-elaya-border bg-studio-bg-3/50'}`}
    >
      <span className="text-[12px] shrink-0">{PRIORITY_ICON[task.prioritaet] ?? '⚪'}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-semibold m-0 truncate ${overdue ? 'text-studio-red' : 'text-studio-white'}`}>
          {task.titel}
        </p>
        <p className="text-[10px] text-studio-w4 m-0 mt-0.5">
          {task.kunden_name || 'Allgemein'} · {task.typ} · Fällig: {fmtCrmDate(task.faellig_am)}
          {overdue && ' ⚠'}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={complete}
          className="p-1.5 rounded-md border-0 bg-elaya-success/15 text-elaya-success cursor-pointer hover:bg-elaya-success/25"
          title="Erledigen"
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={remove}
          className="p-1.5 rounded-md border-0 bg-studio-red/10 text-studio-red cursor-pointer hover:bg-studio-red/20"
          title="Löschen"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

const Section = ({ title, tasks, colorClass, onChange }) => {
  if (!tasks.length) return null
  return (
    <div className="mb-5">
      <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 m-0 ${colorClass}`}>
        {title} ({tasks.length})
      </h3>
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onChange={onChange} />
      ))}
    </div>
  )
}

const CrmTasksTab = ({ tasks, loading, onRefresh, onNewTask }) => {
  const grouped = useMemo(() => {
    const heute = startOfDay()
    const morgen = new Date(heute)
    morgen.setDate(morgen.getDate() + 1)
    const wEnde = new Date(heute)
    wEnde.setDate(wEnde.getDate() + 7)

    const open = tasks.filter((t) => !t.erledigt)
    const done = tasks.filter((t) => t.erledigt).slice(-5).reverse()

    const byDate = (t) => startOfDay(new Date(t.faellig_am))

    return {
      overdue: open.filter((t) => byDate(t) < heute),
      today: open.filter((t) => {
        const d = byDate(t)
        return d >= heute && d < morgen
      }),
      week: open.filter((t) => {
        const d = byDate(t)
        return d >= morgen && d <= wEnde
      }),
      later: open.filter((t) => byDate(t) > wEnde),
      done,
      openCount: open.length,
    }
  }, [tasks])

  if (loading) {
    return <div className="py-16 text-center text-studio-w2 text-[13px]">Lade Aufgaben…</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={onNewTask}>+ Neue Aufgabe</Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="Keine Aufgaben"
          description="Lege Follow-ups und Erinnerungen für deine Leads an."
        />
      ) : (
        <>
          {grouped.openCount === 0 && (
            <Card className="mb-4 text-center py-5">
              <p className="text-elaya-success text-[13px] m-0">Alle Aufgaben erledigt!</p>
            </Card>
          )}

          <Section title="Überfällig" tasks={grouped.overdue} colorClass="text-studio-red" onChange={onRefresh} />
          <Section title="Heute" tasks={grouped.today} colorClass="text-studio-gold" onChange={onRefresh} />
          <Section title="Diese Woche" tasks={grouped.week} colorClass="text-studio-teal-2" onChange={onRefresh} />
          <Section title="Später" tasks={grouped.later} colorClass="text-studio-w4" onChange={onRefresh} />

          {grouped.done.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-studio-w4 mb-2 m-0">
                Zuletzt erledigt
              </h3>
              {grouped.done.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-studio-bg-3/30 mb-1 opacity-60"
                >
                  <span className="text-[11px]">✓</span>
                  <span className="flex-1 text-[11px] text-studio-w3 line-through truncate">{t.titel}</span>
                  <span className="text-[9px] text-studio-w4">{fmtCrmDate(t.erledigt_am)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CrmTasksTab
