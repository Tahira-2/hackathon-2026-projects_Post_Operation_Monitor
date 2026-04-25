import 'package:flutter/material.dart';
import 'package:medimeal/models/active_workflow.dart';
import 'package:medimeal/models/medications.dart';

import '../models/care_state.dart';

import '../models/workflow_suggestion.dart';
import '../services/mock_data_service.dart';
import '../services/workflow_engine.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late List<Medication> medications;

  String? latestSummary;
  WorkflowSuggestion? latestSuggestion;
  CareState? latestCareState;

  List<ActiveWorkflow> activeWorkflows = [];

  @override
  void initState() {
    super.initState();
    medications = MockDataService.getMedications();
  }

  String buildPlanMyDaySummary() {
    if (latestSummary == null) {
      return 'No actions logged yet. Mark a medication as taken to begin today’s care flow.';
    }

    final workflowCount = activeWorkflows.length;
    final careSummary = latestCareState?.summary ?? 'No active care state.';
    final caution = latestCareState?.caution ?? '';

    return '''
$latestSummary

$currentWorkflowText(workflowCount)

Care status: $careSummary
${caution.isNotEmpty ? '\nCaution: $caution' : ''}
''';
  }

  String currentWorkflowText(int count) {
    if (count == 0) {
      return 'No active workflows are running yet.';
    } else if (count == 1) {
      return '1 active workflow is supporting today’s routine.';
    } else {
      return '$count active workflows are supporting today’s routine.';
    }
  }

  void onMedicationTaken(Medication medication) {
    final result = WorkflowEngine.processMedicationTaken(medication);

    setState(() {
      latestSummary = result.nextStepSummary;
      latestSuggestion = result.suggestion;
      latestCareState = result.careState;
    });
  }

  void activateWorkflow() {
    if (latestSuggestion == null) return;

    final newWorkflow = ActiveWorkflow(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: latestSuggestion!.title,
      description: latestSuggestion!.description,
      status: 'Active',
    );

    setState(() {
      activeWorkflows.add(newWorkflow);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Workflow activated'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MediMeal'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Plan My Day',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  buildPlanMyDaySummary(),
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Today’s Medications',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...medications.map(
              (medication) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        medication.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text('Dose: ${medication.dosage}'),
                      Text('Time: ${medication.time}'),
                      Text('Instructions: ${medication.instructions}'),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => onMedicationTaken(medication),
                        child: const Text('Taken'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'What’s Next',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: latestSummary == null
                    ? const Text(
                        'No event logged yet. Mark a medication as taken to activate the workflow.',
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            latestSummary!,
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(height: 12),
                          if (latestSuggestion != null) ...[
                            Text(
                              latestSuggestion!.title,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(latestSuggestion!.description),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: activateWorkflow,
                              child: Text(latestSuggestion!.actionLabel),
                            ),
                          ],
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Care State',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: latestCareState == null
                    ? const Text('No active care state yet.')
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            latestCareState!.summary,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(latestCareState!.caution),
                          if (latestCareState!.weeklyLimit > 0) ...[
                            const SizedBox(height: 8),
                            Text(
                              'Weekly usage: ${latestCareState!.weeklyUsage}/${latestCareState!.weeklyLimit}',
                            ),
                          ],
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Active Workflows',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (activeWorkflows.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No active workflows yet.'),
                ),
              )
            else
              ...activeWorkflows.map(
                (workflow) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          workflow.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(workflow.description),
                        const SizedBox(height: 8),
                        Text(
                          'Status: ${workflow.status}',
                          style: const TextStyle(fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
