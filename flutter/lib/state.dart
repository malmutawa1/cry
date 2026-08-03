import 'package:flutter/foundation.dart';
import 'models.dart';
import 'data/garments.dart';

/// App-wide state (subscription + item usage). Flutter port of src/store.tsx
/// (customer-facing subset).
class User {
  final String name;
  final String email;
  const User(this.name, this.email);
}

class AppState extends ChangeNotifier {
  User? _user;
  Plan? _activePlan;
  int _itemsUsed = 15; // seeded mid-cycle, like the web demo
  bool _annual = false;

  User? get user => _user;
  bool get signedIn => _user != null;
  Plan? get activePlan => _activePlan;
  int get itemsUsed => _itemsUsed;
  bool get annual => _annual;

  void login(String email) {
    final local = email.contains('@') ? email.split('@').first : 'there';
    _user = User(local.isEmpty ? 'there' : (local[0].toUpperCase() + local.substring(1)), email);
    notifyListeners();
  }

  void loginWithApple() {
    _user = const User('Abdullah', 'r8s2pw7hj4@privaterelay.appleid.com');
    notifyListeners();
  }

  void logout() {
    _user = null;
    _activePlan = null;
    _itemsUsed = 15;
    notifyListeners();
  }

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
