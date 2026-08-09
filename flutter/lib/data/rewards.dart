/// Loyalty tiers + redeemable rewards. Mirrors data/rewards.ts.
class Reward {
  final String id;
  final String labelKey;
  final int pts;
  const Reward(this.id, this.labelKey, this.pts);
}

const rewards = <Reward>[
  Reward('items', 'rewards.r.items', 750),
  Reward('credit', 'rewards.r.credit', 2000),
  Reward('month', 'rewards.r.month', 6000),
];

class Tier {
  final String key;
  final int min;
  const Tier(this.key, this.min);
}

const tiers = <Tier>[
  Tier('Bronze', 0),
  Tier('Silver', 1500),
  Tier('Gold', 5000),
  Tier('Platinum', 12000),
];

Tier currentTier(int pts) {
  var t = tiers.first;
  for (final tier in tiers) {
    if (pts >= tier.min) t = tier;
  }
  return t;
}

Tier? nextTier(int pts) {
  for (final tier in tiers) {
    if (pts < tier.min) return tier;
  }
  return null;
}
