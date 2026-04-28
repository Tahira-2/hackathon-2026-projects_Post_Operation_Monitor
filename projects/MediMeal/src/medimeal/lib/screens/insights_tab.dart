import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../widgets/care_state_card.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';

class InsightsTab extends StatelessWidget {
  final CareState? careState;

  const InsightsTab({
    super.key,
    required this.careState,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Insights',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Care status and adaptive tracking',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Care State'),
          CareStateCard(careState: careState),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Notes'),
          const SummaryCard(
            text:
                'This screen will later show adaptive insights, limits, and recommendation changes over time.',
          ),
        ],
      ),
    );
  }
}
