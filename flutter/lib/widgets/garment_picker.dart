import 'package:flutter/material.dart';
import '../models.dart';
import '../theme.dart';
import '../data/garments.dart';
import 'garment_icon.dart';

/// Full-screen garment declaration: pick step → review step → returns the
/// selection (Map of garmentId → qty) when the user proceeds to checkout.
/// Returns null if dismissed. Flutter port of GarmentPicker.tsx.
class GarmentPicker extends StatefulWidget {
  final Map<String, int> initial;
  const GarmentPicker({super.key, this.initial = const {}});

  @override
  State<GarmentPicker> createState() => _GarmentPickerState();
}

class _GarmentPickerState extends State<GarmentPicker> {
  late Map<String, int> sel = {...widget.initial};
  String q = '';
  bool review = false;

  int get pieces => selectionPieces(sel);
  int get units => selectionUnits(sel);

  void bump(String id, int d) {
    setState(() {
      final v = (sel[id] ?? 0) + d;
      if (v <= 0) {
        sel.remove(id);
      } else {
        sel[id] = v;
      }
    });
  }

  List<GarmentGroup> get filtered {
    final query = q.trim().toLowerCase();
    if (query.isEmpty) return garmentGroups;
    return garmentGroups
        .map((g) => GarmentGroup(g.id, g.name, g.nameAr,
            g.items.where((it) => it.name.toLowerCase().contains(query) || it.nameAr.contains(q.trim())).toList()))
        .where((g) => g.items.isNotEmpty)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(child: review ? _buildReview() : _buildPick()),
    );
  }

  // ---------------- Pick step ----------------
  Widget _buildPick() {
    return Column(
      children: [
        _TopBar(
          title: 'What are you sending?',
          leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: TextField(
            onChanged: (v) => setState(() => q = v),
            decoration: InputDecoration(
              hintText: 'Search garments…',
              prefixIcon: const Icon(Icons.search, size: 20),
              filled: true,
              fillColor: AppColors.surface2,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(13), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
            ),
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            children: [
              const Padding(
                padding: EdgeInsets.only(bottom: 12, top: 6, left: 2),
                child: Text("Add each garment you're handing over — we count it live.",
                    style: TextStyle(color: AppColors.muted, fontSize: 13)),
              ),
              for (final g in filtered) ...[
                Padding(
                  padding: const EdgeInsets.only(left: 2, bottom: 8, top: 4),
                  child: Text(g.name.toUpperCase(),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.muted, letterSpacing: 0.4)),
                ),
                for (final it in g.items) _pickRow(g, it),
                const SizedBox(height: 8),
              ],
            ],
          ),
        ),
        _footer(
          left: _totalBlock(),
          button: _primary('Done', units == 0 ? null : () => setState(() => review = true)),
        ),
      ],
    );
  }

  Widget _pickRow(GarmentGroup g, Garment it) {
    final qty = sel[it.id] ?? 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: qty > 0 ? Color.alphaBlend(AppColors.accent.withOpacity(0.06), AppColors.surface) : AppColors.surface,
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: qty > 0 ? AppColors.accent : AppColors.line),
      ),
      child: Row(
        children: [
          _thumb(g, it),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(it.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5)),
                Text(it.addon ? 'Add-on' : (it.pieces == 1 ? '1 piece' : '${it.pieces} pieces'),
                    style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          _stepBtn(Icons.remove, qty == 0 ? null : () => bump(it.id, -1)),
          SizedBox(width: 26, child: Text('$qty', textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800))),
          _stepBtn(Icons.add, () => bump(it.id, 1)),
        ],
      ),
    );
  }

  // ---------------- Review step ----------------
  Widget _buildReview() {
    final chosen = garmentGroups
        .map((g) => GarmentGroup(g.id, g.name, g.nameAr, g.items.where((it) => (sel[it.id] ?? 0) > 0).toList()))
        .where((g) => g.items.isNotEmpty)
        .toList();
    return Column(
      children: [
        _TopBar(
          title: 'Review your items',
          leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => setState(() => review = false)),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
            children: [
              Container(
                padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 20),
                decoration: BoxDecoration(
                  color: Color.alphaBlend(AppColors.accent.withOpacity(0.08), AppColors.surface),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.line),
                ),
                child: Column(children: [
                  Text('$pieces',
                      style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w900, color: AppColors.accent, height: 0.9)),
                  const SizedBox(height: 4),
                  const Text('total pieces', style: TextStyle(fontWeight: FontWeight.w800)),
                  Text('$units garments', style: const TextStyle(color: AppColors.muted, fontSize: 12.5, fontWeight: FontWeight.w600)),
                ]),
              ),
              const SizedBox(height: 16),
              for (final g in chosen) ...[
                Padding(
                  padding: const EdgeInsets.only(left: 2, bottom: 6),
                  child: Text(g.name.toUpperCase(),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.muted, letterSpacing: 0.4)),
                ),
                for (final it in g.items) _reviewLine(g, it),
                const SizedBox(height: 12),
              ],
            ],
          ),
        ),
        _footer(button: _primary('Proceed to checkout', () => Navigator.pop(context, sel))),
      ],
    );
  }

  Widget _reviewLine(GarmentGroup g, Garment it) {
    final qty = sel[it.id] ?? 0;
    final sub = it.pieces * qty;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 2),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.line))),
      child: Row(children: [
        _thumb(g, it, size: 34, icon: 22),
        const SizedBox(width: 10),
        Text('$qty×', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.accent)),
        const SizedBox(width: 8),
        Expanded(child: Text(it.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14.5))),
        Text(it.addon ? 'Add-on' : (sub == 1 ? '1 piece' : '$sub pieces'),
            style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700, fontSize: 12.5)),
      ]),
    );
  }

  // ---------------- Shared bits ----------------
  Widget _thumb(GarmentGroup g, Garment it, {double size = 40, double icon = 26}) {
    final tint = AppColors.groupTint[g.id]!;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Color.alphaBlend(tint.withOpacity(0.16), AppColors.surface),
        borderRadius: BorderRadius.circular(size * 0.3),
      ),
      child: Center(child: GarmentIcon(it, size: icon, color: HSLColor.fromColor(tint).withLightness(0.42).toColor())),
    );
  }

  Widget _totalBlock() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('$pieces', style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: AppColors.accent, height: 1)),
          const SizedBox(width: 6),
          const Padding(padding: EdgeInsets.only(bottom: 4), child: Text('total pieces', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.muted, fontSize: 12.5))),
        ]),
        Text('$units garments', style: const TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _footer({Widget? left, required Widget button}) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(color: AppColors.surface, border: Border(top: BorderSide(color: AppColors.line))),
      child: Row(children: [
        if (left != null) ...[left, const SizedBox(width: 12)],
        Expanded(child: button),
      ]),
    );
  }

  Widget _primary(String label, VoidCallback? onTap) {
    return SizedBox(
      height: 52,
      child: FilledButton(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accent,
          disabledBackgroundColor: AppColors.line,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
      ),
    );
  }

  Widget _stepBtn(IconData ic, VoidCallback? onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(9),
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: const Color(0xFFEDEFF3),
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: AppColors.line),
        ),
        child: Icon(ic, size: 16, color: onTap == null ? AppColors.muted.withOpacity(0.4) : AppColors.text),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  final String title;
  final Widget leading;
  const _TopBar({required this.title, required this.leading});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(children: [
        leading,
        Expanded(child: Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800))),
        const SizedBox(width: 48),
      ]),
    );
  }
}
