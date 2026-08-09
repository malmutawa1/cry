import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../i18n.dart';
import '../theme.dart';
import '../data/rewards.dart';

/// Loyalty / rewards page (pushed from Home). Flutter port of Loyalty.tsx.
class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    final l = context.watch<LocaleState>();
    final pts = s.points;
    final tier = currentTier(pts);
    final next = nextTier(pts);
    final progress = next == null ? 1.0 : ((pts - tier.min) / (next.min - tier.min)).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        title: Text(l.t('rewards.title')),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 24),
        children: [
          // Hero
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFB5822F), Color(0xFF7C581A)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(tier.key, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
              const SizedBox(height: 6),
              Text('$pts', style: const TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900, height: 1)),
              Text(l.t('rewards.points'), style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(999),
                child: LinearProgressIndicator(value: progress.toDouble(), minHeight: 8, backgroundColor: Colors.white24, color: Colors.white),
              ),
              if (next != null) ...[
                const SizedBox(height: 8),
                Text('${next.min - pts} pts to ${next.key}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12.5)),
              ],
            ]),
          ),
          const SizedBox(height: 20),
          Text(l.t('rewards.ways'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          _earnRow(Icons.local_mall_outlined, l.t('rewards.earn.pickup'), '+50'),
          _earnRow(Icons.group_add_outlined, l.t('rewards.earn.refer'), '+200'),
          _earnRow(Icons.star_outline, l.t('rewards.earn.annual'), '+500'),
          const SizedBox(height: 20),
          Text(l.t('rewards.redeem'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          for (final r in rewards) _redeemRow(context, s, l, r),
        ],
      ),
    );
  }

  Widget _earnRow(IconData ic, String label, String pts) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.line)),
        child: Row(children: [
          CircleAvatar(radius: 20, backgroundColor: AppColors.surface2, child: Icon(ic, color: AppColors.text, size: 20)),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700))),
          Text(pts, style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w800)),
        ]),
      );

  Widget _redeemRow(BuildContext context, AppState s, LocaleState l, Reward r) {
    final enough = s.points >= r.pts;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.line)),
      child: Row(children: [
        const CircleAvatar(radius: 20, backgroundColor: Color(0xFFEAF4FE), child: Icon(Icons.card_giftcard, color: AppColors.accent, size: 20)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(l.t(r.labelKey), style: const TextStyle(fontWeight: FontWeight.w700)),
            Text('${r.pts} ${l.t('rewards.pts')}', style: const TextStyle(color: AppColors.muted, fontSize: 12.5)),
          ]),
        ),
        enough
            ? FilledButton(
                onPressed: () {
                  if (s.redeem(r.pts)) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l.t('rewards.redeemed'))));
                  }
                },
                style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                child: Text(l.t('rewards.redeem')),
              )
            : Text(l.t('rewards.need', {'n': r.pts - s.points}), style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600, fontSize: 12.5)),
      ]),
    );
  }
}
