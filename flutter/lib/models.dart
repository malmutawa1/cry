/// Domain models for the Pressd customer app (Flutter port).

class Plan {
  final String id;
  final String name;
  final String nameAr;
  final double priceKwd;

  /// Monthly allowance in weighted items.
  final int items;
  final String tagline;
  final String taglineAr;
  final bool popular;
  final List<String> perks;
  final List<String> perksAr;

  const Plan({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.priceKwd,
    required this.items,
    required this.tagline,
    required this.taglineAr,
    this.popular = false,
    required this.perks,
    required this.perksAr,
  });
}

class ItemCategory {
  final String id;
  final String name;
  final String nameAr;
  final int multiplier;
  final double kgEst;
  final double costKwd;
  final String examples;

  const ItemCategory(this.id, this.name, this.nameAr, this.multiplier, this.kgEst, this.costKwd, this.examples);
}

class AddOn {
  final String id;
  final String name;
  final String nameAr;
  final double priceKwd;
  const AddOn(this.id, this.name, this.nameAr, this.priceKwd);
}

class Garment {
  final String id;
  final String name;
  final String nameAr;

  /// Allowance pieces this garment counts as (0 for separate add-ons).
  final int pieces;
  final bool addon;

  const Garment(this.id, this.name, this.nameAr, this.pieces, {this.addon = false});
}

class GarmentGroup {
  final String id;
  final String name;
  final String nameAr;
  final List<Garment> items;
  const GarmentGroup(this.id, this.name, this.nameAr, this.items);
}
