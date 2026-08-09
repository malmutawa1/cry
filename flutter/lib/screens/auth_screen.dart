import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../i18n.dart';
import '../state.dart';
import '../theme.dart';

/// Email/password sign-in & sign-up backed by Supabase, plus a "Continue with
/// Apple" demo. Flutter port of the customer Auth screen.
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  bool signUp = false;
  bool busy = false;
  String? error;

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final s = context.read<AppState>();
    setState(() {
      busy = true;
      error = null;
    });
    final em = email.text.trim();
    final pw = password.text;
    final res = signUp ? await s.signUp(name.text.trim(), em, pw) : await s.signIn(em, pw);
    if (!mounted) return;
    setState(() => busy = false);
    if (!res.ok) {
      setState(() => error = res.error);
    } else if (res.error == 'confirm') {
      setState(() => error = 'Check your email to confirm your account.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.watch<LocaleState>();
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        actions: [
          TextButton(onPressed: () => context.read<LocaleState>().toggle(), child: Text(l.isAr ? 'EN' : 'ع')),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(18)),
              child: const Center(child: Text('P', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900))),
            ),
            const SizedBox(height: 20),
            Text(l.t(signUp ? 'auth.createTitle' : 'auth.title'), style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(l.t('auth.sub'), style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 24),
            if (signUp) ...[
              _field(l.t('auth.name'), name),
              const SizedBox(height: 12),
            ],
            _field(l.t('auth.email'), email, keyboard: TextInputType.emailAddress),
            const SizedBox(height: 12),
            _field(l.t('auth.password'), password, obscure: true),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(error!, style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600)),
            ],
            const SizedBox(height: 20),
            SizedBox(
              height: 52,
              child: FilledButton(
                onPressed: busy ? null : _submit,
                style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                child: busy
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(l.t(signUp ? 'auth.create' : 'auth.signIn'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(height: 10),
            Center(
              child: TextButton(
                onPressed: () => setState(() { signUp = !signUp; error = null; }),
                child: Text(l.t(signUp ? 'auth.haveAccount' : 'auth.noAccount')),
              ),
            ),
            const SizedBox(height: 6),
            Row(children: [
              const Expanded(child: Divider()),
              Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text(l.t('auth.or'), style: const TextStyle(color: AppColors.muted))),
              const Expanded(child: Divider()),
            ]),
            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () => context.read<AppState>().loginWithApple(),
                icon: const Icon(Icons.apple, color: Colors.black),
                label: Text(l.t('auth.apple'), style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)), side: const BorderSide(color: AppColors.line)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController c, {bool obscure = false, TextInputType? keyboard}) {
    return TextField(
      controller: c,
      obscureText: obscure,
      keyboardType: keyboard,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(13), borderSide: const BorderSide(color: AppColors.line)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(13), borderSide: const BorderSide(color: AppColors.line)),
      ),
    );
  }
}
