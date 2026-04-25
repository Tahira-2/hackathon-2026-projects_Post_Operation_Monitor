import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    medications = MockDataService.getMedications();
  }

  void onMedicationTaken(Medication medication) {
    final result = WorkflowEngine.processMedicationTaken(medication);

    setState(() {
      latestSummary = result.nextStepSummary;
      latestSuggestion = result.suggestion;
      latestCareState = result.careState;
    });
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
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      '${latestSuggestion!.actionLabel} clicked',
                                    ),
                                  ),
                                );
                              },
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
          ],
        ),
      ),
    );
  }
}
