import 'package:flutter/material.dart';
import '../models/care_state.dart';

class CareStateCard extends StatelessWidget {
  final CareState? careState;

  const CareStateCard({
    super.key,
    required this.careState,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: careState == null
            ? const Text(
                'No active care state yet.',
                style: TextStyle(color: Color(0xFFCBD5E1)),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    careState!.summary,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 17,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    careState!.caution,
                    style: const TextStyle(
                      color: Color(0xFFCBD5E1),
                      height: 1.4,
                    ),
                  ),
                  if (careState!.weeklyLimit > 0) ...[
                    const SizedBox(height: 14),
                    LinearProgressIndicator(
                      value: careState!.weeklyUsage / careState!.weeklyLimit,
                      backgroundColor: const Color(0xFF334155),
                      valueColor:
                          const AlwaysStoppedAnimation(Color(0xFF14B8A6)),
                      borderRadius: BorderRadius.circular(999),
                      minHeight: 10,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Weekly usage: ${careState!.weeklyUsage}/${careState!.weeklyLimit}',
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                      ),
                    ),
                  ],
                ],
              ),
      ),
    );
  }
}
