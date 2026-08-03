import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'state.dart';
import 'screens/home_screen.dart';
import 'screens/plans_screen.dart';
import 'screens/pickup_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const PressdApp(),
    ),
  );
}

class PressdApp extends StatelessWidget {
  const PressdApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pressd',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const RootShell(),
    );
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
    final pages = [
      HomeScreen(onSeePlans: () => setState(() => tab = 1), onSchedule: () => setState(() => tab = 2)),
      const PlansScreen(),
      PickupScreen(onSeePlans: () => setState(() => tab = 1)),
    ];
    return Scaffold(
      body: SafeArea(bottom: false, child: pages[tab]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: tab,
        onDestinationSelected: (i) => setState(() => tab = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.credit_card_outlined), selectedIcon: Icon(Icons.credit_card), label: 'Plans'),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), selectedIcon: Icon(Icons.shopping_bag), label: 'Pickup'),
        ],
      ),
    );
  }
}
