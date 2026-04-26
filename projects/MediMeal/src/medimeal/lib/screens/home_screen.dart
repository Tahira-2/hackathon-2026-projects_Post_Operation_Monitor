// import 'package:flutter/material.dart';
// import 'package:medimeal/models/active_workflow.dart';
// import 'package:medimeal/models/medications.dart';
// import 'package:medimeal/widgets/care_state_card.dart';
// import 'package:medimeal/widgets/medication_card.dart';
// import 'package:medimeal/widgets/section_title.dart';
// import 'package:medimeal/widgets/summary_card.dart';
// import 'package:medimeal/widgets/workflow_card.dart';

// import '../models/care_state.dart';

// import '../models/workflow_suggestion.dart';
// import '../services/mock_data_service.dart';
// import '../services/workflow_engine.dart';

// class HomeScreen extends StatefulWidget {
//   const HomeScreen({super.key});

//   @override
//   State<HomeScreen> createState() => _HomeScreenState();
// }

// class _HomeScreenState extends State<HomeScreen> {
//   late List<Medication> medications;

//   String? latestSummary;
//   WorkflowSuggestion? latestSuggestion;
//   CareState? latestCareState;

//   List<ActiveWorkflow> activeWorkflows = [];

//   @override
//   void initState() {
//     super.initState();
//     medications = MockDataService.getMedications();
//   }

//   String buildPlanMyDaySummary() {
//     if (latestSummary == null) {
//       return 'No actions logged yet. Mark a medication as taken to begin today’s care flow.';
//     }

//     final workflowCount = activeWorkflows.length;
//     final careSummary = latestCareState?.summary ?? 'No active care state.';
//     final caution = latestCareState?.caution ?? '';

//     return '''
// $latestSummary

// ${currentWorkflowText(workflowCount)}

// Care status: $careSummary
// ${caution.isNotEmpty ? '\nCaution: $caution' : ''}
// ''';
//   }

//   String currentWorkflowText(int count) {
//     if (count == 0) {
//       return 'No active workflows are running yet.';
//     } else if (count == 1) {
//       return '1 active workflow is supporting today’s routine.';
//     } else {
//       return '$count active workflows are supporting today’s routine.';
//     }
//   }

//   void onMedicationTaken(Medication medication) {
//     final result = WorkflowEngine.processMedicationTaken(medication);

//     setState(() {
//       latestSummary = result.nextStepSummary;
//       latestSuggestion = result.suggestion;
//       latestCareState = result.careState;
//     });
//   }

//   void activateWorkflow() {
//     if (latestSuggestion == null) return;

//     final newWorkflow = ActiveWorkflow(
//       id: DateTime.now().millisecondsSinceEpoch.toString(),
//       title: latestSuggestion!.title,
//       description: latestSuggestion!.description,
//       status: 'Active',
//     );

//     setState(() {
//       activeWorkflows.add(newWorkflow);
//     });

//     ScaffoldMessenger.of(context).showSnackBar(
//       const SnackBar(
//         content: Text('Workflow activated'),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('MediMeal'),
//       ),
//       body: SingleChildScrollView(
//         padding: const EdgeInsets.all(16),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             const SectionTitle(title: 'Plan My Day'),
//             SummaryCard(text: buildPlanMyDaySummary()),
//             const SizedBox(height: 24),
//             const SectionTitle(title: 'Today’s Medications'),
//             ...medications.map(
//               (medication) => MedicationCard(
//                 medication: medication,
//                 onTaken: () => onMedicationTaken(medication),
//               ),
//             ),
//             const SizedBox(height: 24),
//             const Text(
//               'What’s Next',
//               style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
//             ),
//             const SizedBox(height: 12),
//             Card(
//               child: Padding(
//                 padding: const EdgeInsets.all(16),
//                 child: latestSummary == null
//                     ? const Text(
//                         'No event logged yet. Mark a medication as taken to activate the workflow.',
//                       )
//                     : Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           Text(
//                             latestSummary!,
//                             style: const TextStyle(fontSize: 16),
//                           ),
//                           const SizedBox(height: 12),
//                           if (latestSuggestion != null) ...[
//                             Text(
//                               latestSuggestion!.title,
//                               style: const TextStyle(
//                                 fontSize: 16,
//                                 fontWeight: FontWeight.w600,
//                               ),
//                             ),
//                             const SizedBox(height: 4),
//                             Text(latestSuggestion!.description),
//                             const SizedBox(height: 12),
//                             ElevatedButton(
//                               onPressed: activateWorkflow,
//                               child: Text(latestSuggestion!.actionLabel),
//                             ),
//                           ],
//                         ],
//                       ),
//               ),
//             ),
//             const SizedBox(height: 24),
//             const Text(
//               'Care State',
//               style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
//             ),
//             const SizedBox(height: 12),
//             const SectionTitle(title: 'Care State'),
//             CareStateCard(careState: latestCareState),
//             const SizedBox(height: 24),
//             const SectionTitle(title: 'Active Workflows'),
//             if (activeWorkflows.isEmpty)
//               const SummaryCard(
//                 text: 'No active workflows yet.',
//               )
//             else
//               ...activeWorkflows.map(
//                 (workflow) => WorkflowCard(workflow: workflow),
//               ),
//             const SizedBox(height: 24),
//           ],
//         ),
//       ),
//     );
//   }
// }
