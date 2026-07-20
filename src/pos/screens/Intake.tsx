import { useMemo, useState, type CSSProperties } from 'react'
import { money, planById, type Intake as IntakeRec, type Member, type AddOnCounts } from '../data'
import { usePos } from '../store'
import {
  useItemsConfig,
  weightedItems,
  pieceCount,
  categoryName,
  addOnName,
  type ItemCounts,
} from '../../data/items'
import { RUSH_TIER_ORDER, TIERS, tierFee, type RushTier } from '../../data/rush'
import { useRush } from '../../useRush'
import { Search, Receipt, Hanger } from '../../components/Icons'

export function Intake() {
  const { members, plans, recordIntake } = usePos()
  const cfg = useItemsConfig()
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
            const cap = plan?.items ?? 0
            const pct = cap ? Math.min(100, (m.itemsUsed / cap) * 100) : 0
            const over = m.itemsUsed > cap
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
                  <span>{m.itemsUsed} / {cap} items</span>
                  <span className={over ? 'over' : ''}>
                    {over ? `${m.itemsUsed - cap} over` : `${cap - m.itemsUsed} left`}
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

      {ticket && <Ticket rec={ticket} plansCap={planById(plans, ticket.planId)?.items ?? 0} onClose={() => setTicket(null)} />}
    </div>
  )

  function IntakePanel({ member, onDone }: { member: Member; onDone: (r: IntakeRec) => void }) {
    const plan = planById(plans, member.planId)
    const cap = plan?.items ?? 0
    const remaining = Math.max(0, cap - member.itemsUsed)

    const [counts, setCounts] = useState<ItemCounts>({})
    const [addOnCounts, setAddOnCounts] = useState<AddOnCounts>({})
    const [hangers, setHangers] = useState(true)
    const { settings, capReached } = useRush()
    const [tierSel, setTierSel] = useState<RushTier>('standard')
    const tier: RushTier = capReached && tierSel !== 'standard' ? 'standard' : tierSel

    const items = weightedItems(counts, cfg)
    const pieces = pieceCount(counts)
    const overageItems = Math.max(0, items - remaining)
    const overageCharge = round(overageItems * cfg.overagePerItem)
    const addOnCharge = round(cfg.addOns.reduce((s, a) => s + (addOnCounts[a.id] || 0) * a.priceKwd, 0))
    const rushFee = tierFee(tier, settings)
    const totalCharge = round(overageCharge + addOnCharge + rushFee)

    function setCat(id: string, delta: number) {
      setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
    }
    function setAddon(id: string, delta: number) {
      setAddOnCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
    }

    function submit() {
      const rec = recordIntake({ memberId: member.id, counts, addOnCounts, hangers, tier, rushFee })
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
              <b>{cap} items</b>
            </div>
            <div className="allow-col">
              <span className="k">Used</span>
              <b>{member.itemsUsed}</b>
            </div>
            <div className="allow-col">
              <span className="k">Remaining</span>
              <b className="accent">{remaining}</b>
            </div>
          </div>

          <div className="item-cats">
            {cfg.categories.map((c) => (
              <div key={c.id} className="item-cat-row">
                <div className="icr-main">
                  <span className="icr-name">{categoryName(c, 'en')}</span>
                  <span className="icr-eg">×{c.multiplier} · {c.examples.split(',').slice(0, 3).join(', ')}</span>
                </div>
                <div className="stepper">
                  <button onClick={() => setCat(c.id, -1)}>−</button>
                  <span>{counts[c.id] || 0}</span>
                  <button onClick={() => setCat(c.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="live-count">
            <div className="lc-main">
              <b>{items}</b> items counted
              <span className="lc-pieces">{pieces} pieces</span>
            </div>
            <div className={`lc-remain${overageItems > 0 ? ' over' : ''}`}>
              {overageItems > 0 ? `${overageItems} over allowance` : `${remaining - items} left this month`}
            </div>
          </div>

          <div className="item-cats addon-cats">
            <div className="ic-head">Bedding add-ons · billed separately</div>
            {cfg.addOns.map((a) => (
              <div key={a.id} className="item-cat-row">
                <div className="icr-main">
                  <span className="icr-name">{addOnName(a, 'en')}</span>
                  <span className="icr-eg">{money(a.priceKwd)} each</span>
                </div>
                <div className="stepper">
                  <button onClick={() => setAddon(a.id, -1)}>−</button>
                  <span>{addOnCounts[a.id] || 0}</span>
                  <button onClick={() => setAddon(a.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

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

        <div className="cart-foot">
          <div className="sums">
            {overageCharge > 0 && (
              <div className="row">
                <span>{overageItems} extra items</span>
                <span>+{money(overageCharge)}</span>
              </div>
            )}
            {addOnCharge > 0 && (
              <div className="row">
                <span>Bedding add-ons</span>
                <span>+{money(addOnCharge)}</span>
              </div>
            )}
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
          <button className="pay-btn" disabled={pieces <= 0} onClick={submit}>
            Create order → pipeline
          </button>
        </div>
      </>
    )
  }
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

function Ticket({ rec, plansCap, onClose }: { rec: IntakeRec; plansCap: number; onClose: () => void }) {
  const usedAfter = Math.max(0, rec.remainingBefore - rec.items)
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
              <span>{rec.planName} · {plansCap} items / mo</span>
            </div>
            <div className="r">
              <span>Pieces collected</span>
              <span>{rec.pieces}</span>
            </div>
            <div className="r">
              <span>Counted as</span>
              <span>{rec.items} items</span>
            </div>
            <div className="r">
              <span>Allowance left after</span>
              <span>{usedAfter} items</span>
            </div>
            {rec.overageItems > 0 && (
              <div className="r">
                <span>Extra items ({rec.overageItems})</span>
                <span>+{money(rec.overageCharge)}</span>
              </div>
            )}
            {rec.addOnCharge > 0 && (
              <div className="r">
                <span>Bedding add-ons</span>
                <span>+{money(rec.addOnCharge)}</span>
              </div>
            )}
            <div className="r" style={{ marginTop: 8 }}>
              <span>Handling</span>
              <span>{[rec.hangers ? 'Hangers' : 'Folded', rec.express ? 'Express' : 'Standard'].join(' · ')}</span>
            </div>
            <div className="r grand">
              <span>{rec.overageCharge + rec.addOnCharge > 0 ? 'Billed to card' : 'Covered — no charge'}</span>
              <span>{money(round(rec.overageCharge + rec.addOnCharge + rec.rushFee))}</span>
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
