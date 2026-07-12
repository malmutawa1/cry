import { Minus, Plus } from './Icons'

export function StatusBar() {
  return (
    <div className="statusbar">
      <span>1:37</span>
      <span className="right">
        <span aria-hidden>▪▪▪▪</span>
        <span>5G</span>
        <span className="battery">78</span>
      </span>
    </div>
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease">
        <Minus size={18} />
      </button>
      <span className="count">{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="Increase">
        <Plus size={18} />
      </button>
    </div>
  )
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label="Toggle"
    >
      <span className="knob" />
    </button>
  )
}
