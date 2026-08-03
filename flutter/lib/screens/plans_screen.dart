import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../theme.dart';
import '../models.dart';
import '../data/plans.dart';

class PlansScreen extends StatelessWidget {
  const PlansScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
      children: [
        const Text('Membership', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
        const SizedBox(height: 6),
        const Center(child: Text('One flat price. Every load.', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800))),
        const Center(child: Text('A monthly item allowance — picked up and delivered free.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted))),
        const SizedBox(height: 16),
        for (final p in plans) _PlanCard(plan: p, active: s.activePlan?.id == p.id),
      ],
    );
  }
}

class _PlanCard extends StatelessWidget {
  final Plan plan;
  final bool active;
  const _PlanCard({required this.plan, required this.active});

  @override
  Widget build(BuildContext context) {
    final tint = AppColors.planColors[plan.id] ?? AppColors.accent;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [Color.alphaBlend(tint.withOpacity(0.14), AppColors.surface), AppColors.surface],
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: active ? AppColors.accent : tint.withOpacity(0.45), width: active ? 2 : 1),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (plan.popular)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(999)),
            child: const Text('MOST POPULAR', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
          ),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(plan.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            Text(plan.tagline, style: const TextStyle(color: AppColors.muted)),
          ]),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('${plan.priceKwd.toInt()}', style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
            const Text('KWD / month', style: TextStyle(color: AppColors.muted, fontSize: 12)),
          ]),
        ]),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(999)),
          child: Text('Up to ${plan.items} items / month', style: const TextStyle(fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 12),
        for (final perk in plan.perks)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Row(children: [
              const Icon(Icons.check, size: 18, color: AppColors.green),
              const SizedBox(width: 10),
              Text(perk),
            ]),
          ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: active
              ? OutlinedButton(onPressed: null, child: const Text('This is your current plan'))
              : FilledButton(
                  onPressed: () {
                    context.read<AppState>().subscribe(plan);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Subscribed to ${plan.name}')));
                  },
                  style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                  child: Text('Subscribe to ${plan.name}', style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
        ),
      ]),
    );
  }
}
