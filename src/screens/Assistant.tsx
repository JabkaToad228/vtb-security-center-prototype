import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { A } from '../assets'
import { chips, detectTopic, FALLBACK, GREETING, HELLO, replies, type Reply } from '../data/assistant'
import type { AssistantTopic } from '../data/cases'
import { checkLink, findUrl, type LinkVerdict } from '../lib/linkCheck'
import { Header } from '../shell/chrome'
import { Chip } from '../ui/kit'

type Msg = { id: number; from: 'bot' | 'user'; text: string; action?: Reply['action']; verdict?: LinkVerdict; animate?: boolean }

const isTopic = (t: string | null): t is AssistantTopic => chips.some((c) => c.topic === t)

/** Новый экран: скриптованный AI-помощник. Ответы и проверка ссылок работают локально. */
export function Assistant() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'bot', text: GREETING }])
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const awaitLink = useRef(false)
  const nextId = useRef(1)
  const scroller = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const scrollDown = () => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }
  useEffect(scrollDown, [msgs, typing])

  function botSay(m: Omit<Msg, 'id' | 'from'>) {
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((prev) => [...prev, { ...m, id: nextId.current++, from: 'bot', animate: true }])
    }, 650 + Math.random() * 350)
  }

  function respond(text: string, forced?: AssistantTopic) {
    const url = findUrl(text)
    if (url) {
      const verdict = checkLink(url)
      awaitLink.current = false
      if (verdict) {
        const intro = { safe: 'Проверил ссылку.', warn: 'Проверил ссылку — есть поводы насторожиться.', danger: 'Осторожно! Это похоже на фишинг.' }[verdict.level]
        return botSay({ text: intro, verdict })
      }
    }
    const topic = forced ?? detectTopic(text)
    if (topic === 'link') {
      awaitLink.current = true
      return botSay({ text: replies.link.text })
    }
    if (awaitLink.current && !topic) return botSay({ text: 'Не вижу ссылку. Вставьте адрес целиком, например vtb-bonus24.ru/pay' })
    if (topic === 'hello') return botSay({ text: HELLO })
    if (topic) return botSay({ text: replies[topic].text, action: replies[topic].action })
    return botSay({ text: FALLBACK })
  }

  function send(text: string, forced?: AssistantTopic) {
    const t = text.trim()
    if (!t || typing) return
    setMsgs((prev) => [...prev, { id: nextId.current++, from: 'user', text: t }])
    setDraft('')
    respond(t, forced)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    const topic = params.get('topic')
    if (isTopic(topic)) {
      const chip = chips.find((c) => c.topic === topic)!
      window.setTimeout(() => send(chip.text, topic), 300)
    }
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <Header
        title="AI-помощник"
        right={
          <span className="absolute right-[18px] top-[-4px] rounded-[6px] bg-light px-[6px] py-[3px] text-t10 font-semibold text-brand" title="Ответы подготовлены заранее">
            демо
          </span>
        }
      />
      <div ref={scroller} className="no-scrollbar flex-1 overflow-y-auto px-[16px] pb-[12px] pt-[4px]">
        <div className="flex flex-col gap-[10px]">
          {msgs.map((m) => (
            <Bubble key={m.id} m={m} onAction={(to) => navigate(to)} onTick={scrollDown} />
          ))}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-[8px]">
                <BotAvatar />
                <div className="flex gap-[4px] rounded-[16px] rounded-bl-[4px] bg-light px-[14px] py-[13px]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-[6px] rounded-full bg-brand"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t border-divider bg-white pb-[calc(22px+env(safe-area-inset-bottom))] pt-[10px]">
        <div className="no-scrollbar flex gap-[7px] overflow-x-auto px-[16px]">
          {chips.map((c) => (
            <Chip key={c.topic} onClick={() => send(c.text, c.topic)}>
              {c.text}
            </Chip>
          ))}
        </div>
        <form
          className="mx-[16px] mt-[10px] flex items-center gap-[8px] rounded-[22px] border border-line pl-[16px] pr-[4px]"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Опишите ситуацию или вставьте ссылку"
            className="h-[42px] min-w-0 flex-1 bg-transparent text-t14 outline-none placeholder:text-muted"
            enterKeyHint="send"
          />
          <button aria-label="Отправить" disabled={!draft.trim() || typing} className="grid size-[36px] shrink-0 place-items-center rounded-full bg-light disabled:opacity-40">
            <img alt="" src={A.iconSend} />
          </button>
        </form>
      </div>
    </div>
  )
}

const BotAvatar = () => (
  <span className="grid size-[30px] shrink-0 place-items-center overflow-hidden rounded-full bg-pale">
    <img alt="" src={A.iconRobot} className="size-[42px] max-w-none" />
  </span>
)

function Bubble({ m, onAction, onTick }: { m: Msg; onAction: (to: string) => void; onTick: () => void }) {
  const [shown, setShown] = useState(m.animate ? 0 : m.text.length)
  const done = shown >= m.text.length

  useEffect(() => {
    if (done) return
    const step = Math.max(2, Math.round(m.text.length / 90))
    const t = window.setInterval(() => {
      setShown((s) => Math.min(m.text.length, s + step))
      onTick()
    }, 16)
    return () => window.clearInterval(t)
  }, [done, m.text.length, onTick])

  if (m.from === 'user')
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[80%] whitespace-pre-line rounded-[16px] rounded-br-[4px] bg-brand px-[14px] py-[10px] text-t14 text-white">
        {m.text}
      </motion.div>
    )

  return (
    <div className="flex items-end gap-[8px]">
      <BotAvatar />
      <div className="max-w-[85%]">
        <div className="whitespace-pre-line rounded-[16px] rounded-bl-[4px] bg-light px-[14px] py-[10px] text-t14">{m.text.slice(0, shown)}</div>
        {done && m.verdict && <VerdictCard v={m.verdict} />}
        {done && m.action && (
          <button onClick={() => onAction(m.action!.to)} className="mt-[6px] rounded-[10px] border border-brand px-[12px] py-[8px] text-t14 font-semibold text-brand active:bg-light">
            {m.action.label} →
          </button>
        )}
      </div>
    </div>
  )
}

const verdictLook = {
  safe: { title: 'Похоже на безопасную ссылку', box: 'border-ok/40 bg-[#eef9ef]', text: 'text-ok' },
  warn: { title: 'Будьте осторожны', box: 'border-[#e3a008]/50 bg-[#fff7e6]', text: 'text-[#9a5b00]' },
  danger: { title: 'Похоже на фишинг', box: 'border-danger/40 bg-[#fff1f1]', text: 'text-danger' },
}

function VerdictCard({ v }: { v: LinkVerdict }) {
  const look = verdictLook[v.level]
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-[6px] rounded-[14px] border px-[14px] py-[10px] ${look.box}`}>
      <div className={`text-t14 font-bold ${look.text}`}>{look.title}</div>
      <div className="mt-[2px] break-all text-t12 text-muted">{v.host}</div>
      <ul className="mt-[6px] flex list-disc flex-col gap-[3px] pl-[16px] text-t12">
        {v.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {v.level !== 'safe' && <div className="mt-[6px] text-t12 font-semibold">Не переходите по ссылке и не вводите данные карты и коды.</div>}
    </motion.div>
  )
}
