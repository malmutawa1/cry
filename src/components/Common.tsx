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
