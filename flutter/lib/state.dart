import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import 'models.dart';
import 'data/garments.dart';
import 'supabase_config.dart';

class AppUser {
  final String name;
  final String email;
  const AppUser(this.name, this.email);
}

/// Number of tracking stages and how long each takes in the demo.
const kStageCount = 6;
const kStageSeconds = 9;

/// Auth result: null error = success.
class AuthResult {
  final bool ok;
  final String? error;
  const AuthResult(this.ok, [this.error]);
}

class AppState extends ChangeNotifier {
  AppUser? _user;
  Plan? _activePlan;
  int _itemsUsed = 15;
  bool _annual = false;
  DateTime? _orderAt;

  // loyalty
  int _points = 320;

  AppState() {
    // Restore an existing Supabase session and follow sign-in/out.
    final session = supabase.auth.currentSession;
    if (session?.user != null) _user = _fromSupabase(session!.user);
    supabase.auth.onAuthStateChange.listen((data) {
      final u = data.session?.user;
      if (u != null) {
        _user = _fromSupabase(u);
        notifyListeners();
      } else if (data.event == sb.AuthChangeEvent.signedOut) {
        _user = null;
        notifyListeners();
      }
    });
  }

  AppUser _fromSupabase(sb.User u) {
    final meta = u.userMetadata ?? const {};
    final name = (meta['name'] as String?)?.trim();
    final email = u.email ?? '';
    final fallback = email.contains('@') ? email.split('@').first : 'there';
    return AppUser(
      (name != null && name.isNotEmpty) ? name : (fallback.isEmpty ? 'there' : fallback[0].toUpperCase() + fallback.substring(1)),
      email,
    );
  }

  AppUser? get user => _user;
  bool get signedIn => _user != null;
  Plan? get activePlan => _activePlan;
  int get itemsUsed => _itemsUsed;
  bool get annual => _annual;
  int get points => _points;
  DateTime? get orderAt => _orderAt;

  int get allowance => _activePlan?.items ?? 0;
  int get remaining => (allowance - _itemsUsed).clamp(0, allowance);

  /// Current tracking stage (0..kStageCount-1) for the active order.
  int get orderStage {
    if (_orderAt == null) return -1;
    final elapsed = DateTime.now().difference(_orderAt!).inSeconds;
    final s = elapsed ~/ kStageSeconds;
    return s < 0 ? 0 : (s > kStageCount - 1 ? kStageCount - 1 : s);
  }

  bool get delivered => orderStage >= kStageCount - 1;

  // ---- Auth (Supabase email/password) ----
  Future<AuthResult> signIn(String email, String password) async {
    try {
      final res = await supabase.auth.signInWithPassword(email: email, password: password);
      if (res.user != null) _user = _fromSupabase(res.user!);
      notifyListeners();
      return const AuthResult(true);
    } on sb.AuthException catch (e) {
      return AuthResult(false, e.message);
    } catch (e) {
      return AuthResult(false, e.toString());
    }
  }

  Future<AuthResult> signUp(String name, String email, String password) async {
    try {
      final res = await supabase.auth.signUp(email: email, password: password, data: {'name': name});
      if (res.user != null) _user = _fromSupabase(res.user!);
      notifyListeners();
      return AuthResult(true, res.session == null ? 'confirm' : null);
    } on sb.AuthException catch (e) {
      return AuthResult(false, e.message);
    } catch (e) {
      return AuthResult(false, e.toString());
    }
  }

  /// Apple demo relay — local, no backend (matches the web demo login).
  void loginWithApple() {
    _user = const AppUser('Abdullah', 'r8s2pw7hj4@privaterelay.appleid.com');
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    _user = null;
    _activePlan = null;
    _itemsUsed = 15;
    _orderAt = null;
    _points = 320;
    notifyListeners();
  }

  // ---- Subscription / pickup ----
  void subscribe(Plan plan, {bool annual = false}) {
    _activePlan = plan;
    _annual = annual;
    notifyListeners();
  }

  /// Record a pickup: add declared pieces, create a trackable order, earn points.
  void checkoutPickup(Map<String, int> selection) {
    _itemsUsed += selectionPieces(selection);
    _orderAt = DateTime.now();
    _points += 50;
    notifyListeners();
  }

  bool redeem(int cost) {
    if (_points < cost) return false;
    _points -= cost;
    notifyListeners();
    return true;
  }
}
