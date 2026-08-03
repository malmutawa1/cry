import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../i18n.dart';
import '../state.dart';
import '../theme.dart';

/// Email/password + "Continue with Apple" demo sign-in. Flutter port of the
/// customer Auth screen (Supabase wiring is a follow-up).
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final email = TextEditingController(text: '');
  final password = TextEditingController(text: '');

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.watch<LocaleState>();
    final s = context.read<AppState>();
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
            Text(l.t('auth.title'), style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(l.t('auth.sub'), style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 24),
            _field(l.t('auth.email'), email, keyboard: TextInputType.emailAddress),
            const SizedBox(height: 12),
            _field(l.t('auth.password'), password, obscure: true),
            const SizedBox(height: 20),
            SizedBox(
              height: 52,
              child: FilledButton(
                onPressed: () => s.login(email.text.trim().isEmpty ? 'you@pressd.app' : email.text.trim()),
                style: FilledButton.styleFrom(backgroundColor: AppColors.accent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999))),
                child: Text(l.t('auth.signIn'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
              ),
            ),
            const SizedBox(height: 16),
            Row(children: [
              const Expanded(child: Divider()),
              Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text(l.t('auth.or'), style: const TextStyle(color: AppColors.muted))),
              const Expanded(child: Divider()),
            ]),
            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: s.loginWithApple,
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
