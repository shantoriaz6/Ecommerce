import React, { useEffect, useMemo, useRef, useState } from 'react'
import axiosInstance from '../services/axios'

const LiveChatWidget = ({ contextProductId = null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const listRef = useRef(null)

  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID?.() || String(Date.now()),
      role: 'assistant',
      text: "Hi! I’m your store assistant. Ask me about products, price, stock, or say ‘suggest me’ and I’ll recommend options.",
      suggestions: []
    }
  ])

  const headerColor = useMemo(() => ({ backgroundColor: '#284B63' }), [])

  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMsg = {
      id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
      role: 'user',
      text: trimmed,
      suggestions: []
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsSending(true)

    try {
      const response = await axiosInstance.post('/chat', { message: trimmed, productId: contextProductId })
      const payload = response?.data?.data

      const assistantMsg = {
        id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
        role: 'assistant',
        text: payload?.reply || 'Sorry, I could not generate a reply right now.',
        suggestions: payload?.suggestions || []
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const assistantMsg = {
        id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
        role: 'assistant',
        text: err?.response?.data?.message || 'Sorry, the live chat is unavailable right now.',
        suggestions: []
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity"
        style={headerColor}
        aria-label={isOpen ? 'Close live chat' : 'Open live chat'}
      >
        {/* Chat icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m-6 7l-3-3H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-9l-3 3z" />
        </svg>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between text-white" style={headerColor}>
            <div className="font-semibold">Live Chat (AI)</div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-90"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-lg px-3 py-2 text-white'
                      : 'max-w-[85%] rounded-lg px-3 py-2 bg-white text-gray-800 border border-gray-200'
                  }
                  style={m.role === 'user' ? headerColor : undefined}
                >
                  <div className="text-sm whitespace-pre-wrap">{m.text}</div>

                  {!!m.suggestions?.length && (
                    <div className="mt-3 space-y-2">
                      {m.suggestions.map((s) => (
                        <div key={s._id} className="text-xs bg-gray-50 border border-gray-200 rounded-md p-2">
                          <div className="font-semibold text-gray-800">{s.name}</div>
                          <div className="text-gray-600">
                            ৳{typeof s.effectivePrice === 'number' ? s.effectivePrice : s.price}
                            {typeof s.effectivePrice === 'number' && s.effectivePrice !== s.price ? ` (was ৳${s.price})` : ''}
                            {' '}• {s.category}
                            {s.brand ? ` • ${s.brand}` : ''}
                            {typeof s.stock === 'number' ? ` • stock: ${s.stock}` : ''}
                            {typeof s.discount === 'number' && s.discount > 0 ? ` • ${s.discount}% off` : ''}
                          </div>
                          {s.reason ? <div className="text-gray-600 mt-1">{s.reason}</div> : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-3 py-2 bg-white text-gray-800 border border-gray-200 text-sm">
                  Typing...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask about products, price, stock, or suggestions..."
                className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#284B63' }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isSending || !input.trim()}
                className="px-4 py-2 rounded-md text-white disabled:opacity-60"
                style={headerColor}
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Tip: try “suggest me a phone under ৳30000” or “price of iPhone”.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LiveChatWidget
