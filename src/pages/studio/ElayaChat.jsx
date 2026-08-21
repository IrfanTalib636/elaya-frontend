import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Send, Sparkles, UserRound, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendElayaChat } from '../../api/chat'
import { listCustomers, getCustomer } from '../../api/customers'
import { listCases } from '../../api/cases'
import { getApiErrorMessage } from '../../lib/apiError'
import { Button, Card, PageHeader, Spinner } from '../../components/ui'
import ElayaLogo from '../../components/ElayaLogo'
import useContent from '../../i18n/useContent'

const STORAGE_KEY = 'elaya-studio-chat-v1'

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const welcomeMessage = (welcomeText) => ({
  id: 'welcome',
  role: 'assistant',
  text: welcomeText,
  ts: Date.now(),
})

const loadStored = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.messages)) return null
    return parsed
  } catch {
    return null
  }
}

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })

const buildHistory = (messages) =>
  messages
    .filter((m) => m.id !== 'welcome' && m.text?.trim())
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text.slice(0, 4000),
    }))

export default function StudioElayaChat() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const customerIdParam = searchParams.get('customerId') || ''
  const caseIdParam = searchParams.get('caseId') || ''
  const { studioElayaChat: copy } = useContent()

  const stored = useMemo(() => loadStored(), [])
  const [messages, setMessages] = useState(() => stored?.messages || [welcomeMessage(copy.welcome)])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerHits, setCustomerHits] = useState([])
  const [searching, setSearching] = useState(false)
  const [focusCustomer, setFocusCustomer] = useState(stored?.focusCustomer || null)
  const [focusCase, setFocusCase] = useState(stored?.focusCase || null)
  const [caseOptions, setCaseOptions] = useState([])
  const bottomRef = useRef(null)
  const searchTimer = useRef(null)

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, focusCustomer, focusCase })
    )
  }, [messages, focusCustomer, focusCase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    if (!customerIdParam) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const res = await getCustomer(customerIdParam)
        const c = res.data?.data?.customer
        if (!cancelled && c) {
          setFocusCustomer({
            id: String(c._id || c.id || customerIdParam),
            name: `${c.vorname || ''} ${c.nachname || ''}`.trim() || c.email,
          })
        }
      } catch {
        if (!cancelled) setFocusCustomer({ id: customerIdParam, name: copy.contextCustomer })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customerIdParam, copy.contextCustomer])

  useEffect(() => {
    const cid = focusCustomer?.id
    if (!cid) {
      setCaseOptions([])
      if (!caseIdParam) setFocusCase(null)
      return undefined
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await listCases({ customer_id: cid, limit: 40 })
        const rows = res.data?.data?.cases || []
        if (cancelled) return
        const options = rows.map((c) => ({
          id: String(c._id || c.id),
          label: c.bodyLabel || c.tc_title || c.caseId || 'Fall',
        }))
        setCaseOptions(options)
        if (caseIdParam) {
          const found = options.find((o) => o.id === caseIdParam)
          setFocusCase(found || { id: caseIdParam, label: copy.openCase })
        }
      } catch {
        if (caseIdParam && !cancelled) setFocusCase({ id: caseIdParam, label: copy.openCase })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [focusCustomer?.id, caseIdParam, copy.openCase])

  const runSearch = useCallback(async (q) => {
    const term = q.trim()
    if (term.length < 2) {
      setCustomerHits([])
      return
    }
    setSearching(true)
    try {
      const res = await listCustomers({ search: term, limit: 8 })
      setCustomerHits(res.data?.data?.customers || [])
    } catch {
      setCustomerHits([])
    } finally {
      setSearching(false)
    }
  }, [])

  const onSearchChange = (value) => {
    setCustomerQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      void runSearch(value)
    }, 280)
  }

  const selectCustomer = (row) => {
    const id = String(row._id || row.id)
    setFocusCustomer({
      id,
      name: `${row.vorname || ''} ${row.nachname || ''}`.trim() || row.email,
    })
    setFocusCase(null)
    setCustomerQuery('')
    setCustomerHits([])
    setSearchParams({ customerId: id }, { replace: true })
  }

  const clearContext = () => {
    setFocusCustomer(null)
    setFocusCase(null)
    setCaseOptions([])
    setSearchParams({}, { replace: true })
  }

  const resetChat = () => {
    setMessages([welcomeMessage(copy.welcome)])
    setDraft('')
  }

  const send = async (text) => {
    const message = (text ?? draft).trim()
    if (!message || sending) return

    const userMsg = { id: createId(), role: 'user', text: message, ts: Date.now() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setDraft('')
    setSending(true)

    try {
      const history = buildHistory(nextMessages.slice(0, -1))
      const res = await sendElayaChat({
        message,
        history,
        customer_id: focusCustomer?.id || undefined,
        case_id: focusCase?.id || undefined,
      })
      const data = res.data?.data || {}
      const reply = data.reply || copy.unavailable
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          text: reply,
          ts: Date.now(),
          ai_available: data.ai_available !== false,
        },
      ])
    } catch (err) {
      toast.error(getApiErrorMessage(err, copy.loadError))
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          text: copy.unavailable,
          ts: Date.now(),
          error: true,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    void send()
  }

  return (
    <div className="p-6 max-w-[960px] h-[calc(100vh-0px)] flex flex-col min-h-0">
      <PageHeader title={copy.title} subtitle={copy.subtitle}>
        <Button size="sm" variant="secondary" onClick={resetChat}>
          {copy.newChat}
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-studio-w3 text-[10px] font-semibold uppercase tracking-wider">
            {copy.contextLabel}
          </span>
          {focusCustomer ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-studio-gold/15 text-studio-gold-2 text-[11px] font-semibold">
              <UserRound size={12} />
              {focusCustomer.name}
              <button
                type="button"
                onClick={clearContext}
                className="border-0 bg-transparent text-studio-gold-2 cursor-pointer p-0 leading-none"
                aria-label="Kontext entfernen"
              >
                <X size={12} />
              </button>
            </span>
          ) : (
            <span className="text-studio-w2 text-[12px]">{copy.contextNone}</span>
          )}
          {focusCustomer && focusCase ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-studio-bg-4 text-studio-w1 text-[11px] font-semibold border border-elaya-border">
              {focusCase.label}
            </span>
          ) : null}
          {focusCustomer ? (
            <button
              type="button"
              className="text-studio-gold-2 text-[12px] bg-transparent border-0 cursor-pointer"
              onClick={() => navigate(`/studio/customers/${focusCustomer.id}`)}
            >
              {copy.openCustomer} →
            </button>
          ) : null}
        </div>

        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-w3 pointer-events-none" />
          <input
            type="search"
            value={customerQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={copy.contextSearch}
            className="w-full pl-8 pr-3 py-[8px] rounded-[10px] border-[1.5px] border-elaya-border-strong bg-studio-bg-3 text-studio-white text-[13px] outline-none focus:border-studio-gold placeholder:text-studio-w3"
          />
          {(searching || customerHits.length > 0) && (
            <div className="absolute z-20 left-0 right-0 mt-1 rounded-[10px] border border-elaya-border bg-studio-bg-3 shadow-lg overflow-hidden">
              {searching ? (
                <div className="py-3 flex justify-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                customerHits.map((row) => (
                  <button
                    key={row._id || row.id}
                    type="button"
                    onClick={() => selectCustomer(row)}
                    className="w-full text-left px-3 py-2 border-0 border-b border-elaya-border last:border-0 bg-transparent hover:bg-studio-bg-4 cursor-pointer"
                  >
                    <p className="text-studio-white text-[13px] m-0 font-medium">
                      {`${row.vorname || ''} ${row.nachname || ''}`.trim() || row.email}
                    </p>
                    <p className="text-studio-w3 text-[11px] m-0">{row.email}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {caseOptions.length > 1 ? (
          <div className="flex gap-1.5 flex-wrap">
            {caseOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setFocusCase(opt)
                  setSearchParams(
                    { customerId: focusCustomer.id, caseId: opt.id },
                    { replace: true }
                  )
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
                  focusCase?.id === opt.id
                    ? 'bg-elaya-success/15 text-elaya-success border-elaya-success/40'
                    : 'bg-transparent text-studio-w2 border-elaya-border hover:text-studio-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Card padding="none" className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-elaya-border flex items-center gap-2">
          <ElayaLogo size="sm" markOnly />
          <div>
            <p className="text-studio-white text-[13px] font-semibold m-0">Elaya</p>
            <p className="text-studio-w3 text-[11px] m-0">KI-Assistentin · Claude</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-studio-bg/40">
          {messages.map((m) => {
            const mine = m.role === 'user'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                {!mine ? (
                  <span className="w-7 h-7 rounded-full bg-studio-gold/20 text-studio-gold-2 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Sparkles size={13} />
                  </span>
                ) : null}
                <div
                  className={`max-w-[80%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                    mine
                      ? 'bg-studio-gold/20 text-studio-white border border-studio-gold/30'
                      : m.error
                        ? 'bg-elaya-error/10 text-studio-w1 border border-elaya-error/30'
                        : 'bg-studio-bg-4 text-studio-w1 border border-elaya-border'
                  }`}
                >
                  {m.text}
                  <div className={`text-[10px] mt-1 ${mine ? 'text-studio-gold-2/80' : 'text-studio-w3'}`}>
                    {fmtTime(m.ts)}
                  </div>
                </div>
              </div>
            )
          })}
          {sending ? (
            <div className="flex items-center gap-2 text-studio-w3 text-[12px]">
              <Sparkles size={13} className="text-studio-gold-2" />
              {copy.thinking}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 ? (
          <div className="px-4 py-3 border-t border-elaya-border flex gap-1.5 flex-wrap">
            {copy.prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={sending}
                onClick={() => void send(prompt)}
                className="px-2.5 py-1.5 rounded-[10px] text-[11px] text-left text-studio-w1 bg-studio-bg-4 border border-elaya-border hover:border-studio-gold/40 cursor-pointer disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-elaya-border flex items-end gap-2 bg-studio-bg-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder={copy.placeholder}
            className="flex-1 resize-none rounded-[12px] bg-studio-bg-4 border border-elaya-border text-studio-white text-[13px] px-3 py-2.5 outline-none focus:border-studio-gold/50 placeholder:text-studio-w3"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="shrink-0 w-11 h-11 rounded-[12px] bg-studio-gold text-studio-bg flex items-center justify-center border-0 cursor-pointer disabled:opacity-40"
            aria-label={copy.send}
          >
            <Send size={16} />
          </button>
        </form>
      </Card>
    </div>
  )
}
