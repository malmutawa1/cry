import { useStore } from '../store'
import { useI18n } from '../i18n'
import { Toggle } from '../components/Common'
import { Close } from '../components/Icons'

function Preview({ variant, accent }: { variant: 'light' | 'dark'; accent: 'blue' | 'pink' }) {
  const acc = accent === 'pink' ? '#f2589e' : variant === 'dark' ? '#4cc4ff' : '#2ba6f0'
  const bg = variant === 'dark' ? '#141416' : '#ffffff'
  const card = variant === 'dark' ? '#26262b' : '#eceef2'
  const line = variant === 'dark' ? '#33333a' : '#dfe2e8'
  const swatches =
    variant === 'dark'
      ? ['#8a9299', '#b9a45a', '#b57a4f', '#4f9e73', '#6f79c7', '#5f97c0']
      : ['#b6bec6', '#f0d95a', '#f0956a', '#78d9a0', '#9aa8f0', '#7cc7f0']
  return (
    <div className="disp-preview" style={{ background: bg, borderColor: line }}>
      <div className="dp-top" style={{ background: card }}>
        <span className="dp-mark" style={{ background: acc }}>P</span>
        <span className="dp-lines">
          <span style={{ background: line }} />
          <span style={{ background: line, width: '60%' }} />
        </span>
      </div>
      <div className="dp-grid">
        {swatches.map((s, i) => (
          <span key={i} style={{ background: s }} />
        ))}
      </div>
    </div>
  )
}

export default function Display({ onBack }: { onBack: () => void }) {
  const { mode, setMode, accent, reduceMotion, setReduceMotion } = useStore()
  const { t } = useI18n()
  const system = mode === 'system'

  function toggleDevice(v: boolean) {
    if (v) return setMode('system')
    const sysDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
    setMode(sysDark ? 'dark' : 'light')
  }

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label="Back">
          <Close />
        </button>
        <h1>{t('display.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="screen">
        <div className="disp-label">{t('display.appearance')}</div>
        <div className="card-group disp-card-group">
          <div className={`disp-grid-cards ${system ? 'dim' : ''}`}>
            <button className="disp-card" onClick={() => setMode('light')} disabled={system}>
              <Preview variant="light" accent={accent} />
              <span className="disp-name">{t('display.light')}</span>
              <span className={`disp-radio ${mode === 'light' ? 'on' : ''}`} />
            </button>
            <button className="disp-card" onClick={() => setMode('dark')} disabled={system}>
              <Preview variant="dark" accent={accent} />
              <span className="disp-name">{t('display.dark')}</span>
              <span className={`disp-radio ${mode === 'dark' ? 'on' : ''}`} />
            </button>
          </div>

          <div className="disp-device">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dd-title">{t('display.device')}</div>
              <div className="dd-sub">{t('display.device.sub')}</div>
            </div>
            <Toggle on={system} onChange={toggleDevice} />
          </div>
        </div>

        <div className="disp-label">{t('display.motion')}</div>
        <div className="card-group disp-card-group">
          <div className="disp-device">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dd-title">{t('display.reduceMotion')}</div>
              <div className="dd-sub">{t('display.reduceMotion.sub')}</div>
            </div>
            <Toggle on={reduceMotion} onChange={setReduceMotion} />
          </div>
        </div>
      </div>
    </>
  )
}
