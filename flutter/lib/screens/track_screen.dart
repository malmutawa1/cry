import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../i18n.dart';
import '../theme.dart';

class TrackScreen extends StatefulWidget {
  final VoidCallback onSchedule;
  const TrackScreen({super.key, required this.onSchedule});

  @override
  State<TrackScreen> createState() => _TrackScreenState();
}

class _TrackScreenState extends State<TrackScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    final l = context.watch<LocaleState>();
    if (s.orderAt == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.local_shipping_outlined, size: 40, color: AppColors.muted),
            const SizedBox(height: 12),
            Text(l.t('track.none.title'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            Text(l.t('track.none.sub'), textAlign: TextAlign.center, style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 16),
            FilledButton(onPressed: widget.onSchedule, child: Text(l.t('track.none.cta'))),
          ]),
        ),
      );
    }

    final stage = s.orderStage;
    final delivered = s.delivered;
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
      children: [
        Row(children: [
          Text(l.t('track.title'), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
          const Spacer(),
          if (!delivered)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppColors.accent.withOpacity(0.12), borderRadius: BorderRadius.circular(999)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 7, height: 7, decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle)),
                const SizedBox(width: 6),
                Text(l.t('track.live'), style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w800, fontSize: 12)),
              ]),
            ),
        ]),
        const SizedBox(height: 16),
        // Status header
        Container(
          padding: const EdgeInsets.all(18),
          width: double.infinity,
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.line)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(l.t('st.$stage'), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(delivered ? l.t('track.delivered') : l.t('track.eta', {'label': _etaLabel(stage, l)}),
                style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 14),
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: (stage + 1) / kStageCount,
                minHeight: 8,
                backgroundColor: AppColors.surface2,
                color: delivered ? AppColors.green : AppColors.accent,
              ),
            ),
          ]),
        ),
        const SizedBox(height: 14),
        // Driver card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
          child: Row(children: [
            const CircleAvatar(radius: 22, backgroundColor: AppColors.surface2, child: Icon(Icons.person, color: AppColors.muted)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(l.t('track.driver'), style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                const Text('Yousef · Pressd', style: TextStyle(fontWeight: FontWeight.w700)),
              ]),
            ),
            IconButton(onPressed: () {}, icon: const Icon(Icons.call, color: AppColors.accent)),
          ]),
        ),
        const SizedBox(height: 18),
        // Timeline
        for (int i = 0; i < kStageCount; i++) _timelineRow(l, i, stage),
      ],
    );
  }

  String _etaLabel(int stage, LocaleState l) => l.t('st.${(stage + 1).clamp(0, kStageCount - 1)}');

  Widget _timelineRow(LocaleState l, int i, int stage) {
    final done = i < stage;
    final current = i == stage;
    final color = done || current ? AppColors.accent : AppColors.line;
    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Column(children: [
          Container(
            width: 22, height: 22,
            decoration: BoxDecoration(color: done ? AppColors.accent : AppColors.surface, shape: BoxShape.circle, border: Border.all(color: color, width: 2)),
            child: done ? const Icon(Icons.check, size: 14, color: Colors.white) : (current ? Center(child: Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle))) : null),
          ),
          if (i < kStageCount - 1) Expanded(child: Container(width: 2, color: done ? AppColors.accent : AppColors.line)),
        ]),
        const SizedBox(width: 12),
        Padding(
          padding: const EdgeInsets.only(bottom: 18, top: 1),
          child: Text(l.t('st.$i'),
              style: TextStyle(fontWeight: current ? FontWeight.w800 : FontWeight.w600, color: done || current ? AppColors.text : AppColors.muted)),
        ),
      ]),
    );
  }
}
