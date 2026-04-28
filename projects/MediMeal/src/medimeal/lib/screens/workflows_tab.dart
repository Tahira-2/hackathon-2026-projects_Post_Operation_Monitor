import 'package:flutter/material.dart';

import '../models/active_workflow.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';
import '../widgets/workflow_card.dart';

class WorkflowsTab extends StatelessWidget {
  final List<ActiveWorkflow> activeWorkflows;

  const WorkflowsTab({
    super.key,
    required this.activeWorkflows,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Workflows',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Your active support routines',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Active Workflows'),
          if (activeWorkflows.isEmpty)
            const SummaryCard(text: 'No active workflows yet.')
          else
            ...activeWorkflows.map(
              (workflow) => WorkflowCard(workflow: workflow),
            ),
        ],
      ),
    );
  }
}
