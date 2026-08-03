import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../i18n.dart';
import '../state.dart';
import '../theme.dart';

class AccountScreen extends StatelessWidget {
  final VoidCallback onSeePlans;
  const AccountScreen({super.key, required this.onSeePlans});

  @override
  Widget build(BuildContext context) {
    final l = context.watch<LocaleState>();
    final s = context.watch<AppState>();
    final user = s.user;
    final plan = s.activePlan;
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
      children: [
        Text(l.t('account.title'), style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        Row(children: [
          CircleAvatar(radius: 30, backgroundColor: AppColors.accent, child: Text(user?.name.substring(0, 1) ?? '?', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800))),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(user?.name ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              Text(user?.email ?? '', style: const TextStyle(color: AppColors.muted), overflow: TextOverflow.ellipsis),
            ]),
          ),
        ]),
        const SizedBox(height: 18),
        // Usage card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
          child: plan == null
              ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.t('account.none.title'), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 10),
                  FilledButton(onPressed: onSeePlans, child: Text(l.t('home.plan.none.cta'))),
                ])
              : Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.t('home.plan.active', {'name': plan.name}), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: plan.items == 0 ? 0 : (s.itemsUsed / plan.items).clamp(0.0, 1.0),
                      minHeight: 8, backgroundColor: AppColors.surface2, color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(l.t('account.used', {'n': s.itemsUsed}), style: const TextStyle(color: AppColors.muted, fontSize: 12.5)),
                    Text(l.t('account.allow', {'n': plan.items}), style: const TextStyle(color: AppColors.muted, fontSize: 12.5)),
                  ]),
                ]),
        ),
        const SizedBox(height: 14),
        // Settings
        Container(
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
          child: Column(children: [
            ListTile(
              leading: const Icon(Icons.language),
              title: Text(l.t('account.language')),
              trailing: Text(l.isAr ? 'العربية' : 'English', style: const TextStyle(color: AppColors.muted)),
              onTap: () => context.read<LocaleState>().toggle(),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: Text(l.t('account.signout'), style: const TextStyle(color: Colors.redAccent)),
              onTap: () => context.read<AppState>().logout(),
            ),
          ]),
        ),
      ],
    );
  }
}
