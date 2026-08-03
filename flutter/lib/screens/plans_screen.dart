import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../i18n.dart';
import '../theme.dart';
import '../models.dart';
import '../data/plans.dart';

class PlansScreen extends StatelessWidget {
  const PlansScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    final l = context.watch<LocaleState>();
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
      children: [
        Text(l.t('plans.title'), style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
        const SizedBox(height: 6),
        Center(child: Text(l.t('plans.heroTitle'), textAlign: TextAlign.center, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800))),
        Center(child: Text(l.t('plans.heroSub'), textAlign: TextAlign.center, style: const TextStyle(color: AppColors.muted))),
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
    final l = context.watch<LocaleState>();
    final tint = AppColors.planColors[plan.id] ?? AppColors.accent;
    final name = l.isAr ? plan.nameAr : plan.name;
    final perks = l.isAr ? plan.perksAr : plan.perks;
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
            child: Text(l.t('plans.popular'), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
          ),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
              Text(l.isAr ? plan.taglineAr : plan.tagline, style: const TextStyle(color: AppColors.muted)),
            ]),
          ),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('${plan.priceKwd.toInt()}', style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900)),
            Text(l.t('plans.per'), style: const TextStyle(color: AppColors.muted, fontSize: 12)),
          ]),
        ]),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(999)),
          child: Text(l.t('plans.cap', {'n': plan.items}), style: const TextStyle(fontWeight: FontWeight.w800)),
        ),
        const SizedBox(height: 12),
        for (final perk in perks)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Row(children: [
              const Icon(Icons.check, size: 18, color: AppColors.green),
              const SizedBox(width: 10),
              Expanded(child: Text(perk)),
            ]),
          ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: active
              ? OutlinedButton(onPressed: null, child: Text(l.t('plans.current')))
              : FilledButton(
                  onPressed: () {
                    context.read<AppState>().subscribe(plan);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l.t('plans.subscribed', {'name': name}))));
                  },
                  style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                  child: Text(l.t('plans.subscribe', {'name': name}), style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
        ),
      ]),
    );
  }
}
