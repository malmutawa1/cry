import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'state.dart';
import 'i18n.dart';
import 'supabase_config.dart';
import 'screens/home_screen.dart';
import 'screens/plans_screen.dart';
import 'screens/pickup_screen.dart';
import 'screens/track_screen.dart';
import 'screens/account_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/auth_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initSupabase();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppState()),
        ChangeNotifierProvider(create: (_) => LocaleState()),
      ],
      child: const PressdApp(),
    ),
  );
}

class PressdApp extends StatelessWidget {
  const PressdApp({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleState>();
    return MaterialApp(
      title: 'Pressd',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      builder: (context, child) => Directionality(textDirection: locale.dir, child: child!),
      home: const RootGate(),
    );
  }
}

/// Welcome splash → Auth → app shell.
class RootGate extends StatefulWidget {
  const RootGate({super.key});

  @override
  State<RootGate> createState() => _RootGateState();
}

class _RootGateState extends State<RootGate> {
  bool welcomed = false;

  @override
  Widget build(BuildContext context) {
    final s = context.watch<AppState>();
    if (!welcomed) return WelcomeScreen(onDone: () => setState(() => welcomed = true));
    if (!s.signedIn) return const AuthScreen();
    return const RootShell();
  }
}

class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    final l = context.watch<LocaleState>();
    final pages = [
      HomeScreen(
        onSeePlans: () => setState(() => tab = 1),
        onSchedule: () => setState(() => tab = 2),
        onTrack: () => setState(() => tab = 3),
      ),
      const PlansScreen(),
      PickupScreen(onSeePlans: () => setState(() => tab = 1), onTrack: () => setState(() => tab = 3)),
      TrackScreen(onSchedule: () => setState(() => tab = 2)),
      AccountScreen(onSeePlans: () => setState(() => tab = 1)),
    ];
    return Scaffold(
      body: SafeArea(bottom: false, child: pages[tab]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.home_outlined), selectedIcon: const Icon(Icons.home), label: l.t('nav.home')),
          NavigationDestination(icon: const Icon(Icons.credit_card_outlined), selectedIcon: const Icon(Icons.credit_card), label: l.t('nav.plans')),
          NavigationDestination(icon: const Icon(Icons.shopping_bag_outlined), selectedIcon: const Icon(Icons.shopping_bag), label: l.t('nav.pickup')),
          NavigationDestination(icon: const Icon(Icons.local_shipping_outlined), selectedIcon: const Icon(Icons.local_shipping), label: l.t('nav.track')),
          NavigationDestination(icon: const Icon(Icons.person_outline), selectedIcon: const Icon(Icons.person), label: l.t('nav.account')),
        ],
      ),
    );
  }
}
