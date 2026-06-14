import React, { useEffect, useRef } from 'react'

type Props = { logs: string[] }

export default function LiveLogs({ logs }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  return (
    <div className="logs glass card-hover fade-in">
      <div className="text-sm font-medium mb-2">Live Logs</div>
      <div ref={ref}>
        {logs.length === 0 && <div className="text-slate-400">No activity yet.</div>}
        {logs.map((l, i) => (
          <div key={i} className={`log-line ${l.toLowerCase().includes('fail') ? 'log-line--error' : l.toLowerCase().includes('warn') ? 'log-line--warn' : 'log-line--info'}`}>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}
