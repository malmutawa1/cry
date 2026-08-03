import 'package:flutter/material.dart';

/// Palette + theme mirroring the Pressd web app.
class AppColors {
  static const accent = Color(0xFF3AA0E8);
  static const accentInk = Colors.white;
  static const bg = Color(0xFFF4F6F8);
  static const surface = Colors.white;
  static const surface2 = Color(0xFFF0F2F5);
  static const line = Color(0xFFE6E9EE);
  static const text = Color(0xFF10151C);
  static const muted = Color(0xFF7A828E);
  static const green = Color(0xFF22A06B);

  /// Per-plan identity colours (match the web plan dots / cards).
  static const planColors = <String, Color>{
    'solo': Color(0xFF5AA6E8),
    'family': Color(0xFF7C74C0),
    'family-plus': Color(0xFF12A89B), // teal
    'max': Color(0xFF22A06B), // green
  };

  /// Per garment-group tile tint + icon colour.
  static const groupTint = <String, Color>{
    'mens': Color(0xFF4C9BE8),
    'womens': Color(0xFFE86FA8),
    'everyday': Color(0xFF35B7A6),
    'sport': Color(0xFFF0932B),
    'children': Color(0xFFF6C945),
    'bedding': Color(0xFF9B7EDE),
    'linen': Color(0xFF4FB477),
    'delicates': Color(0xFFC07BE8),
    'addons': Color(0xFF8B93A5),
  };
}

ThemeData buildTheme() {
  final base = ThemeData.light(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: base.colorScheme.copyWith(
      primary: AppColors.accent,
      surface: AppColors.surface,
    ),
    textTheme: base.textTheme.apply(
      bodyColor: AppColors.text,
      displayColor: AppColors.text,
      fontFamily: 'SF Pro Text',
    ),
    splashFactory: InkRipple.splashFactory,
  );
}
