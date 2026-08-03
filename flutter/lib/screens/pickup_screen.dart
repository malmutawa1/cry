import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state.dart';
import '../theme.dart';
import '../data/garments.dart';
import '../widgets/garment_picker.dart';

class PickupScreen extends StatefulWidget {
  final VoidCallback onSeePlans;
  const PickupScreen({super.key, required this.onSeePlans});

  @override
  State<PickupScreen> createState() => _PickupScreenState();
}

class _PickupScreenState extends State<PickupScreen> {
  Map<String, int> garments = {};

  int get units => selectionUnits(garments);
  int get pieces => selectionPieces(garments);

  Future<void> _openPicker() async {
    final result = await Navigator.of(context).push<Map<String, int>>(
      MaterialPageRoute(fullscreenDialog: true, builder: (_) => GarmentPicker(initial: garments)),
    );
    if (result != null) {
      // Proceeded to checkout: record the pieces and confirm.
      context.read<AppState>().addPickupSelection(result);
      setState(() => garments = {});
      if (mounted) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            content: Column(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.check_circle, color: AppColors.green, size: 48),
              const SizedBox(height: 12),
              Text("We've collected ${selectionUnits(result)} garments ✓", textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w700)),
            ]),
            actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Done'))],
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    if (s.activePlan == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.event_available, size: 40, color: AppColors.muted),
            const SizedBox(height: 12),
            const Text('No active plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            const Text('Subscribe to a membership to schedule a pickup.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 16),
            FilledButton(onPressed: widget.onSeePlans, child: const Text('See plans')),
          ]),
        ),
      );
    }
    return Column(children: [
      Expanded(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 24),
          children: [
            const Text('Schedule Pickup', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 16),
            _card(icon: Icons.place_outlined, label: 'Address', value: 'Zahra, Hawalli Governorate, Kuwait'),
            _card(icon: Icons.event, label: 'Pick-up', value: 'Today, 6 PM – 8 PM'),
            _card(icon: Icons.local_shipping_outlined, label: 'Delivery', value: 'Tomorrow, 10 AM – 10 PM'),
            const SizedBox(height: 8),
            InkWell(
              onTap: _openPicker,
              borderRadius: BorderRadius.circular(18),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.line)),
                child: Row(children: [
                  Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(color: AppColors.accent.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.shopping_basket_outlined, color: AppColors.accent),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('What are you sending?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                      Text(units > 0 ? '$units garments · $pieces pieces' : "Add the garments you're handing over",
                          style: const TextStyle(color: AppColors.muted, fontSize: 13, fontWeight: FontWeight.w600)),
                    ]),
                  ),
                  Text(units > 0 ? 'Edit ›' : 'Add ›', style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w800)),
                ]),
              ),
            ),
          ],
        ),
      ),
      Container(
        padding: EdgeInsets.fromLTRB(18, 10, 18, 12 + MediaQuery.of(context).padding.bottom),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          if (units == 0)
            const Padding(padding: EdgeInsets.only(bottom: 8), child: Text('Add your items to continue', style: TextStyle(color: AppColors.muted, fontSize: 12.5, fontWeight: FontWeight.w600))),
          SizedBox(
            width: double.infinity, height: 52,
            child: FilledButton(
              onPressed: units == 0 ? _openPicker : _openPicker,
              style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
              child: const Text('Confirm pickup', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            ),
          ),
        ]),
      ),
    ]);
  }

  Widget _card({required IconData icon, required String label, required String value}) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.line)),
        child: Row(children: [
          Icon(icon, color: AppColors.muted),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
            Text(value, style: const TextStyle(fontWeight: FontWeight.w700)),
          ]),
        ]),
      );
}
