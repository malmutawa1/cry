import 'package:flutter/foundation.dart';
import 'models.dart';
import 'data/garments.dart';

/// App-wide state (subscription + item usage). Flutter port of src/store.tsx
/// (customer-facing subset).
class AppState extends ChangeNotifier {
  Plan? _activePlan;
  int _itemsUsed = 15; // seeded mid-cycle, like the web demo
  bool _annual = false;

  Plan? get activePlan => _activePlan;
  int get itemsUsed => _itemsUsed;
  bool get annual => _annual;

  int get allowance => _activePlan?.items ?? 0;
  int get remaining => (allowance - _itemsUsed).clamp(0, allowance);

  void subscribe(Plan plan, {bool annual = false}) {
    _activePlan = plan;
    _annual = annual;
    notifyListeners();
  }

  /// Add the declared garment pieces to the monthly counter (on checkout).
  void addPickupSelection(Map<String, int> selection) {
    _itemsUsed += selectionPieces(selection);
    notifyListeners();
  }
}
