import 'package:flutter/material.dart';
import '../models.dart';

/// Drawn line-icons for garments (no emoji). Flutter port of GarmentIcons.tsx.
/// Coordinates are on a 0..24 grid, scaled to [size].

String garmentIconType(Garment g) {
  final n = g.name.toLowerCase();
  bool has(List<String> w) => w.any(n.contains);
  if (has(['abaya'])) return 'abaya';
  if (has(['bisht', 'farwa'])) return 'bisht';
  if (has(['dishdasha', 'thob', 'jalabiya', 'daraa', 'kaftan', 'deebaj', 'robe', 'bathrobe', 'ihram'])) return 'thobe';
  if (has(['ghutra', 'shemagh', 'milfa', 'boshiya', 'bukhnaq'])) return 'ghutra';
  if (has(['scarf', 'shawl', 'shayla', 'hijab', 'kufiya', 'esharb'])) return 'scarf';
  if (has(['taqiyah', 'cap', 'hat'])) return 'cap';
  if (has(['egal', 'agal'])) return 'egal';
  if (has(['necktie', 'tie'])) return 'tie';
  if (has(['sock'])) return 'socks';
  if (has(['curtain'])) return 'curtain';
  if (has(['towel', 'bath', 'tablecloth', 'napkin', 'placemat', 'runner', 'apron', 'kitchen'])) return 'towel';
  if (has(['sofa', 'couch', 'cushion'])) return 'cushion';
  if (has(['rug', 'prayer', 'jalsa', 'floor', 'bath mat'])) return 'rug';
  if (has(['sheet', 'blanket', 'pillow', 'duvet', 'comforter', 'bedding', 'bolster', 'shozat', 'coverlet', 'quilt', 'bed', 'linen'])) return 'bed';
  if (has(['dress', 'maxi', 'gown', 'nightgown', 'jumpsuit', 'overall'])) return 'dress';
  if (has(['shorts', 'bermuda', 'swim', 'underwear', 'glove'])) return 'shorts';
  if (has(['trousers', 'jeans', 'chinos', 'pants', 'leggings', 'wizar'])) return 'trousers';
  if (has(['jacket', 'blazer', 'coat', 'cardigan', 'hoodie', 'pullover', 'sweater', 'suit', 'tracksuit', 'vest', 'gilet', 'sidairi', 'uniform', 'military'])) return 'jacket';
  if (has(['shirt', 't-shirt', 'polo', 'blouse', 'tunic', 'jersey', 'undershirt', 'fanila', 'pyjama', 'pajama', 'bib', 'newborn', 'swaddle', 'baby', 'clothing', 'school'])) return 'shirt';
  return 'hanger';
}

class GarmentIcon extends StatelessWidget {
  final Garment garment;
  final double size;
  final Color color;
  const GarmentIcon(this.garment, {super.key, this.size = 26, this.color = Colors.black});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _GarmentPainter(garmentIconType(garment), color),
    );
  }
}

class _GarmentPainter extends CustomPainter {
  final String type;
  final Color color;
  _GarmentPainter(this.type, this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24.0;
    final p = Paint()
      ..style = PaintingStyle.stroke
      ..color = color
      ..strokeWidth = 1.5 * s
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    Offset o(double x, double y) => Offset(x * s, y * s);

    Path poly(List<List<double>> pts, {bool close = true}) {
      final path = Path()..moveTo(pts.first[0] * s, pts.first[1] * s);
      for (final pt in pts.skip(1)) {
        path.lineTo(pt[0] * s, pt[1] * s);
      }
      if (close) path.close();
      return path;
    }

    switch (type) {
      case 'thobe':
        canvas.drawPath(poly([[8.5, 3.5], [11, 5.4], [12, 6.2], [13, 5.4], [15.5, 3.5], [18.6, 6.6], [16.9, 8.4], [16.4, 20.5], [7.6, 20.5], [7.1, 8.4], [5.4, 6.6]]), p);
        canvas.drawLine(o(12, 6.2), o(12, 20.5), p);
        break;
      case 'abaya':
        final path = Path()
          ..moveTo(8 * s, 4 * s)
          ..cubicTo(6.4 * s, 5 * s, 6 * s, 6.6 * s, 6 * s, 8 * s)
          ..lineTo(7.4 * s, 8.7 * s)
          ..lineTo(7.4 * s, 20.5 * s)
          ..lineTo(16.6 * s, 20.5 * s)
          ..lineTo(16.6 * s, 8.7 * s)
          ..lineTo(18 * s, 8 * s)
          ..cubicTo(18 * s, 6.6 * s, 17.6 * s, 5 * s, 16 * s, 4 * s);
        canvas.drawPath(path, p);
        canvas.drawLine(o(12, 5), o(12, 20.5), p);
        break;
      case 'bisht':
        canvas.drawPath(poly([[4.5, 6.5], [9, 4.5], [12, 6.3], [15, 4.5], [19.5, 6.5], [17.7, 9], [17.7, 20.5], [6.3, 20.5], [6.3, 9]]), p);
        canvas.drawLine(o(12, 6.3), o(12, 20.5), p);
        canvas.drawLine(o(9, 4.5), o(7.6, 20.5), p);
        canvas.drawLine(o(15, 4.5), o(16.4, 20.5), p);
        break;
      case 'ghutra':
        final path = Path()
          ..moveTo(6.4 * s, 8 * s)
          ..quadraticBezierTo(12 * s, 2.6 * s, 17.6 * s, 8 * s)
          ..lineTo(18.6 * s, 17.5 * s)
          ..quadraticBezierTo(12 * s, 14.8 * s, 5.4 * s, 17.5 * s)
          ..close();
        canvas.drawPath(path, p);
        canvas.drawLine(o(12, 4.4), o(12, 13.5), p);
        break;
      case 'scarf':
        final path = Path()
          ..moveTo(6 * s, 4.5 * s)
          ..quadraticBezierTo(12 * s, 8.6 * s, 18 * s, 4.5 * s)
          ..lineTo(18 * s, 8 * s)
          ..quadraticBezierTo(12 * s, 12 * s, 6 * s, 8 * s)
          ..close();
        canvas.drawPath(path, p);
        canvas.drawLine(o(8.6, 8), o(7.6, 20), p);
        canvas.drawLine(o(15.4, 8), o(16.4, 20), p);
        break;
      case 'cap':
        final path = Path()
          ..moveTo(5 * s, 14.8 * s)
          ..quadraticBezierTo(5 * s, 6.4 * s, 12 * s, 6.4 * s)
          ..quadraticBezierTo(19 * s, 6.4 * s, 19 * s, 14.8 * s);
        canvas.drawPath(path, p);
        canvas.drawLine(o(4, 14.8), o(20, 14.8), p);
        break;
      case 'egal':
        canvas.drawOval(Rect.fromCenter(center: o(12, 11), width: 14.8 * s, height: 9.2 * s), p);
        canvas.drawOval(Rect.fromCenter(center: o(12, 13.2), width: 14.8 * s, height: 9.2 * s), p);
        break;
      case 'dress':
        canvas.drawPath(poly([[9, 4], [11, 5.6], [12, 6.2], [13, 5.6], [15, 4], [17, 8.2], [15.2, 9.2], [18, 20.5], [6, 20.5], [8.8, 9.2], [7, 8.2]]), p);
        break;
      case 'trousers':
        canvas.drawPath(poly([[7.5, 3.6], [16.5, 3.6], [15.7, 20.5], [12.8, 20.5], [12, 10], [11.2, 20.5], [8.3, 20.5]]), p);
        break;
      case 'shorts':
        canvas.drawPath(poly([[7.5, 5], [16.5, 5], [15.9, 14], [13.1, 14], [12, 9.5], [10.9, 14], [8.1, 14]]), p);
        break;
      case 'jacket':
        canvas.drawPath(poly([[8.5, 4], [5.5, 7], [7.3, 9], [7.3, 20.5], [16.7, 20.5], [16.7, 9], [18.5, 7], [15.5, 4], [12, 7]]), p);
        canvas.drawLine(o(12, 7), o(12, 20.5), p);
        break;
      case 'socks':
        final path = Path()
          ..moveTo(10 * s, 3.6 * s)
          ..lineTo(14 * s, 3.6 * s)
          ..lineTo(14 * s, 12 * s)
          ..lineTo(17 * s, 15.6 * s)
          ..quadraticBezierTo(18.2 * s, 17.2 * s, 16.5 * s, 18.6 * s)
          ..lineTo(14.4 * s, 20.1 * s)
          ..quadraticBezierTo(12.5 * s, 21.1 * s, 11 * s, 19.4 * s)
          ..lineTo(9 * s, 17.4 * s)
          ..quadraticBezierTo(7.7 * s, 15.8 * s, 9.4 * s, 14.4 * s)
          ..lineTo(10 * s, 13.9 * s)
          ..close();
        canvas.drawPath(path, p);
        break;
      case 'tie':
        canvas.drawPath(poly([[10.4, 4], [13.6, 4], [14.6, 7.2], [12, 20.5], [9.4, 7.2]]), p);
        canvas.drawPath(poly([[10.4, 4], [12, 6], [13.6, 4]], close: false), p);
        break;
      case 'towel':
        canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(6.5 * s, 4 * s, 11 * s, 16 * s), Radius.circular(1.4 * s)), p);
        canvas.drawLine(o(6.5, 8), o(17.5, 8), p);
        break;
      case 'curtain':
        canvas.drawLine(o(4.5, 4), o(19.5, 4), p);
        for (final x in [6.6, 10.0, 14.0, 17.4]) {
          final path = Path()
            ..moveTo(x * s, 4 * s)
            ..quadraticBezierTo((x - 0.7) * s, 12 * s, x * s, 20 * s);
          canvas.drawPath(path, p);
        }
        break;
      case 'bed':
        canvas.drawLine(o(3.5, 11), o(3.5, 18.5), p);
        canvas.drawLine(o(20.5, 11), o(20.5, 18.5), p);
        canvas.drawLine(o(3.5, 18.5), o(20.5, 18.5), p);
        canvas.drawLine(o(3.5, 14), o(20.5, 14), p);
        canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(6 * s, 8 * s, 6 * s, 3 * s), Radius.circular(1 * s)), p);
        break;
      case 'cushion':
        canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(5 * s, 7.5 * s, 14 * s, 9 * s), Radius.circular(2.6 * s)), p);
        break;
      case 'rug':
        canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(4.5 * s, 7 * s, 15 * s, 10 * s), Radius.circular(1 * s)), p);
        canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(7 * s, 9.4 * s, 10 * s, 5.2 * s), Radius.circular(0.6 * s)), p);
        break;
      case 'hanger':
      default:
        final path = Path()
          ..moveTo(13 * s, 6.8 * s)
          ..lineTo(12 * s, 8.6 * s)
          ..lineTo(4.3 * s, 14.2 * s)
          ..quadraticBezierTo(3.2 * s, 15.2 * s, 4.5 * s, 15.8 * s)
          ..lineTo(19.5 * s, 15.8 * s)
          ..quadraticBezierTo(20.8 * s, 15.2 * s, 19.7 * s, 14.2 * s)
          ..close();
        canvas.drawPath(path, p);
        canvas.drawArc(Rect.fromCircle(center: o(12, 5.4), radius: 1.9 * s), -1.2, 3.6, false, p);
        break;
    }
  }

  @override
  bool shouldRepaint(covariant _GarmentPainter old) => old.type != type || old.color != color;
}
