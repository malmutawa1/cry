import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../theme.dart';
import '../data/items.dart';

class HomeScreen extends StatelessWidget {
  final VoidCallback onSeePlans;
  final VoidCallback onSchedule;
  const HomeScreen({super.key, required this.onSeePlans, required this.onSchedule});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    final plan = s.activePlan;
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
      children: [
        Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(11)),
            child: const Center(child: Text('P', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20))),
          ),
          const SizedBox(width: 10),
          const Text('Pressd', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
        ]),
        const SizedBox(height: 18),
        const Text('Hello, Abdullah', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w800)),
        const Text('Your laundry, handled.', style: TextStyle(color: AppColors.muted, fontSize: 16)),
        const SizedBox(height: 18),
        if (plan != null) ...[
          _heroCard(s),
          const SizedBox(height: 14),
          _countingCard(),
          const SizedBox(height: 18),
          _primary('Schedule a pickup', onSchedule),
        ] else
          _noPlanCard(),
      ],
    );
  }

  Widget _heroCard(AppState s) {
    final plan = s.activePlan!;
    final used = s.itemsUsed;
    final pct = plan.items == 0 ? 0.0 : (used / plan.items).clamp(0.0, 1.0);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.line)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${plan.name} membership', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            Text('$used of ${plan.items} items used this month', style: const TextStyle(color: AppColors.muted)),
          ]),
          Text('${plan.priceKwd.toInt()}', style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: AppColors.accent)),
        ]),
        const SizedBox(height: 12),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(value: pct.toDouble(), minHeight: 8, backgroundColor: AppColors.surface2, color: AppColors.accent),
        ),
        const SizedBox(height: 8),
        Text('${s.remaining} items left this month', style: const TextStyle(color: AppColors.muted, fontSize: 12.5, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _countingCard() {
    Widget row(String name, String eg, String badge, {bool addon = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                Text(eg, style: const TextStyle(color: AppColors.muted, fontSize: 11.5), maxLines: 1, overflow: TextOverflow.ellipsis),
              ]),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 4),
              decoration: BoxDecoration(
                color: addon ? AppColors.surface2 : AppColors.accent.withOpacity(0.12),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(badge, style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: addon ? AppColors.muted : AppColors.accent)),
            ),
          ]),
        );
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('How items are counted', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5)),
        const SizedBox(height: 8),
        for (final c in itemCategories) row(c.name, c.examples.split(',').take(3).join(', '), '= ${c.multiplier}'),
        row('Bedding', 'Duvets, comforters, large bedding', 'Paid add-on', addon: true),
      ]),
    );
  }

  Widget _noPlanCard() => Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.line)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('No active membership', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Pick a monthly plan and stop counting items.', style: TextStyle(color: AppColors.muted)),
          const SizedBox(height: 14),
          _primary('Choose a plan', onSeePlans),
        ]),
      );

  Widget _primary(String label, VoidCallback onTap) => SizedBox(
        height: 52,
        width: double.infinity,
        child: FilledButton(
          onPressed: onTap,
          style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
          child: Text(label, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
        ),
      );
}
