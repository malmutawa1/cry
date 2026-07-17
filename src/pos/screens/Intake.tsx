import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { money, planById, suggestBlocks, type Intake as IntakeRec, type Member } from '../data'
import { round3, usePos } from '../store'
import { RUSH_TIER_ORDER, TIERS, tierFee, type RushTier } from '../../data/rush'
import { useRush } from '../../useRush'
import { Search, Receipt, Hanger } from '../../components/Icons'

export function Intake() {
  const { members, plans, extras, recordIntake } = usePos()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ticket, setTicket] = useState<IntakeRec | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q) || m.phone.includes(q),
    )
  }, [members, query])

  const member = members.find((m) => m.id === selectedId) ?? null

  return (
    <div className="register">
      <div className="reg-catalog">
        <div className="intake-search">
          <span className="g"><Search size={16} /></span>
          <input
            placeholder="Search members by name, area or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="member-list">
          {filtered.map((m) => {
            const plan = planById(plans, m.planId)
            const cap = plan?.capKg ?? 0
            const pct = cap ? Math.min(100, (m.kgUsed / cap) * 100) : 0
            const over = m.kgUsed > cap
            return (
              <button
                key={m.id}
                className={`member-row${selectedId === m.id ? ' on' : ''}`}
                onClick={() => setSelectedId(m.id)}
              >
                <div className="mr-top">
                  <span className="mr-name">{m.name}</span>
                  <span className={`pill plan ${m.planId}`}>{plan?.name}</span>
                </div>
                <div className="mr-area">{m.area}</div>
                <div className="allow-meter">
                  <i className={over ? 'over' : ''} style={{ width: `${pct}%` }} />
                </div>
                <div className="mr-foot">
                  <span>{m.kgUsed} / {cap} kg used</span>
                  <span className={over ? 'over' : ''}>
                    {over ? `${round3(m.kgUsed - cap)} kg over` : `${round3(cap - m.kgUsed)} kg left`}
                  </span>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && <div className="grid-empty">No members match “{query}”.</div>}
        </div>
      </div>

      <aside className="cart">
        {member ? (
          <IntakePanel
            key={member.id}
            member={member}
            onDone={(rec) => {
              setTicket(rec)
              setSelectedId(null)
            }}
          />
        ) : (
          <div className="cart-empty" style={{ height: '100%' }}>
            <div className="big"><Receipt size={40} /></div>
            <div>Select a member to start intake</div>
          </div>
        )}
      </aside>

      {ticket && <Ticket rec={ticket} plansCap={planById(plans, ticket.planId)?.capKg ?? 0} onClose={() => setTicket(null)} />}
    </div>
  )

  function IntakePanel({ member, onDone }: { member: Member; onDone: (r: IntakeRec) => void }) {
    const plan = planById(plans, member.planId)
    const cap = plan?.capKg ?? 0
    const remaining = round3(Math.max(0, cap - member.kgUsed))

    const [kgStr, setKgStr] = useState('')
    const kg = round3(Math.max(0, Number(kgStr) || 0))
    const coveredKg = round3(Math.min(kg, remaining))
    const overflowKg = round3(Math.max(0, kg - remaining))

    const [k5, setK5] = useState(0)
    const [k8, setK8] = useState(0)
    const [hangers, setHangers] = useState(true)
    const { settings, capReached } = useRush()
    const [tierSel, setTierSel] = useState<RushTier>('standard')
    const tier: RushTier = capReached && tierSel !== 'standard' ? 'standard' : tierSel

    // Auto-suggest the cheapest block cover whenever the overflow changes.
    useEffect(() => {
      const s = suggestBlocks(overflowKg, extras)
      setK5(s.k5)
      setK8(s.k8)
    }, [overflowKg])

    const price5 = extras.find((e) => e.kg === 5)?.priceKwd ?? 2
    const price8 = extras.find((e) => e.kg === 8)?.priceKwd ?? 5
    const extraKgAdded = k5 * 5 + k8 * 8
    const extraCharge = round3(k5 * price5 + k8 * price8)
    const rushFee = tierFee(tier, settings)
    const totalCharge = round3(extraCharge + rushFee)
    const shortfall = round3(Math.max(0, overflowKg - extraKgAdded))

    function submit() {
      const rec = recordIntake({
        memberId: member.id,
        kg,
        remainingBefore: remaining,
        coveredKg,
        overflowKg,
        blocks: { k5, k8 },
        extraKgAdded,
        extraCharge,
        hangers,
        tier,
        rushFee,
      })
      if (rec) onDone(rec)
    }

    return (
      <>
        <div className="cart-head">
          <div>
            <h2>{member.name}</h2>
            <div className="count">
              {member.area} · {member.phone}
            </div>
          </div>
          <span className={`pill plan ${member.planId}`}>{plan?.name}</span>
        </div>

        <div className="intake-body">
          <div className="allow-summary">
            <div className="allow-col">
              <span className="k">Allowance</span>
              <b>{cap} kg</b>
            </div>
            <div className="allow-col">
              <span className="k">Used</span>
              <b>{member.kgUsed} kg</b>
            </div>
            <div className="allow-col">
              <span className="k">Remaining</span>
              <b className="accent">{remaining} kg</b>
            </div>
          </div>

          <div className="weigh">
            <label>Batch weight</label>
            <div className="weigh-in">
              <button onClick={() => setKgStr(String(round3(Math.max(0, kg - 1))))}>−</button>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                placeholder="0.0"
                value={kgStr}
                onChange={(e) => setKgStr(e.target.value)}
                autoFocus
              />
              <span className="unit">kg</span>
              <button onClick={() => setKgStr(String(round3(kg + 1)))}>+</button>
            </div>
          </div>

          {kg > 0 && (
            <div className="breakdown">
              <div className="bd-row">
                <span>Covered by subscription</span>
                <span className="green">{coveredKg} kg</span>
              </div>
              <div className="bd-row">
                <span>Beyond allowance</span>
                <span className={overflowKg > 0 ? 'over' : ''}>{overflowKg} kg</span>
              </div>

              {overflowKg > 0 && (
                <div className="blocks">
                  <div className="blocks-head">Extra-capacity blocks</div>
                  <div className="block-row">
                    <span>5 kg block · {money(price5)}</span>
                    <div className="stepper">
                      <button onClick={() => setK5((v) => Math.max(0, v - 1))}>−</button>
                      <span>{k5}</span>
                      <button onClick={() => setK5((v) => v + 1)}>+</button>
                    </div>
                  </div>
                  <div className="block-row">
                    <span>8 kg block · {money(price8)}</span>
                    <div className="stepper">
                      <button onClick={() => setK8((v) => Math.max(0, v - 1))}>−</button>
                      <span>{k8}</span>
                      <button onClick={() => setK8((v) => v + 1)}>+</button>
                    </div>
                  </div>
                  {shortfall > 0 && (
                    <div className="shortfall">⚠ {shortfall} kg still uncovered — add another block.</div>
                  )}
                </div>
              )}

              <div className="rush-pick">
                <div className="rush-pick-h">Service speed</div>
                <div className="tier-seg">
                  {RUSH_TIER_ORDER.map((tid) => {
                    const meta = TIERS[tid]
                    const fee = tierFee(tid, settings)
                    const disabled = tid !== 'standard' && capReached
                    return (
                      <button
                        key={tid}
                        className={`tier-seg-btn${tier === tid ? ' on' : ''}`}
                        style={{ '--tier': meta.color } as CSSProperties}
                        disabled={disabled}
                        onClick={() => setTierSel(tid)}
                      >
                        <span className="tsb-name">{meta.label.en}</span>
                        <span className="tsb-fee">{fee > 0 ? `+${fee} KD` : 'Included'}</span>
                      </button>
                    )
                  })}
                </div>
                {capReached && <div className="rush-cap-note">Rush cap reached — Express/Urgent unavailable today</div>}
              </div>

              <div className="addons">
                <button className={`addon${hangers ? ' on' : ''}`} onClick={() => setHangers((v) => !v)}>
                  <span className="g"><Hanger size={16} /></span> On hangers
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cart-foot">
          <div className="sums">
            <div className="row">
              <span>Extra capacity</span>
              <span>{extraKgAdded > 0 ? `+${extraKgAdded} kg` : '—'}</span>
            </div>
            {rushFee > 0 && (
              <div className="row">
                <span>{TIERS[tier].label.en} rush</span>
                <span>+{money(rushFee)}</span>
              </div>
            )}
            <div className="row total">
              <span>{totalCharge > 0 ? 'Bill to card' : 'Charge'}</span>
              <span>{money(totalCharge)}</span>
            </div>
            {totalCharge > 0 && (
              <div className="row bill-note">
                <span>Card on file</span>
                <span>•••• {member.cardLast4}</span>
              </div>
            )}
          </div>
          <button className="pay-btn" disabled={kg <= 0} onClick={submit}>
            Create order → pipeline
          </button>
        </div>
      </>
    )
  }
}

function Ticket({ rec, plansCap, onClose }: { rec: IntakeRec; plansCap: number; onClose: () => void }) {
  const usedAfter = round3(rec.remainingBefore <= 0 ? 0 : Math.max(0, rec.remainingBefore - rec.coveredKg))
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body receipt">
          <div className="ok">✓</div>
          <h3>Order created</h3>
          <div className="sub">
            {rec.id} · added to the pickup → delivery pipeline
          </div>
          <div className="rcpt-box">
            <div className="r">
              <span>Member</span>
              <span>{rec.memberName}</span>
            </div>
            <div className="r">
              <span>Plan</span>
              <span>{rec.planName} · {plansCap} kg / mo</span>
            </div>
            <div className="r">
              <span>Batch weight</span>
              <span>{rec.kg} kg</span>
            </div>
            <div className="r">
              <span>Covered by subscription</span>
              <span>{rec.coveredKg} kg</span>
            </div>
            <div className="r">
              <span>Allowance left after</span>
              <span>{usedAfter} kg</span>
            </div>
            {rec.extraKgAdded > 0 && (
              <div className="r">
                <span>Extra capacity added</span>
                <span>+{rec.extraKgAdded} kg</span>
              </div>
            )}
            <div className="r" style={{ marginTop: 8 }}>
              <span>Handling</span>
              <span>{[rec.hangers ? 'Hangers' : 'Folded', rec.express ? 'Express' : 'Standard'].join(' · ')}</span>
            </div>
            <div className="r grand">
              <span>{rec.overflowKg > 0 ? 'Billed to card' : 'Covered — no charge'}</span>
              <span>{money(rec.extraCharge)}</span>
            </div>
          </div>
          <button className="btn primary wide" onClick={onClose}>
            Next member
          </button>
        </div>
      </div>
    </div>
  )
}
