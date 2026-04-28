import 'package:flutter/material.dart';

class SummaryCard extends StatelessWidget {
  final String text;

  const SummaryCard({
    super.key,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1E293B),
            Color(0xFF0F766E),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.all(18),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 16,
          height: 1.5,
          color: Colors.white,
        ),
      ),
    );
  }
}
