import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../i18n.dart';
import '../theme.dart';

/// Splash / welcome. Auto-advances after a moment (like the web Welcome).
class WelcomeScreen extends StatefulWidget {
  final VoidCallback onDone;
  const WelcomeScreen({super.key, required this.onDone});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2600), () {
      if (mounted) widget.onDone();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l = context.watch<LocaleState>();
    return Scaffold(
      backgroundColor: AppColors.accent,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
              child: const Center(child: Text('P', style: TextStyle(color: AppColors.accent, fontSize: 44, fontWeight: FontWeight.w900))),
            ),
            const SizedBox(height: 20),
            const Text('Pressd', style: TextStyle(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w900)),
            const SizedBox(height: 6),
            Text(l.t('welcome.tagline'), style: const TextStyle(color: Colors.white70, fontSize: 16)),
            const SizedBox(height: 28),
            TextButton(
              onPressed: widget.onDone,
              child: Text(l.t('welcome.start'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
