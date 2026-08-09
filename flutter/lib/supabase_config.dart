import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase project (mirrors the web app's config). The publishable key is a
/// public client key — safe to ship in the app.
const supabaseUrl = 'https://pdebesxkkqzbcrkporcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_qF5zodM7aED_jshPUdyU4w_rAyYhWwR';

Future<void> initSupabase() async {
  await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
}

SupabaseClient get supabase => Supabase.instance.client;
