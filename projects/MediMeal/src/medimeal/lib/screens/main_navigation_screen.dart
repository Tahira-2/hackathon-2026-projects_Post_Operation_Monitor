import 'package:flutter/material.dart';
import 'package:medimeal/models/hydration_workflow.dart';
import 'package:medimeal/models/medications.dart';
import 'package:medimeal/models/timing_workflow.dart';
import 'package:medimeal/models/user_medication.dart';
import 'package:medimeal/screens/add_medication_screen.dart';
import 'package:medimeal/screens/meals_tab.dart';
import 'package:medimeal/services/hydration_workflow_service.dart';
import 'package:medimeal/services/notification_service.dart';
import 'package:medimeal/services/timing_workflow_service.dart';

import '../models/active_workflow.dart';
import '../models/care_state.dart';
import '../models/medicine_template.dart';
import '../models/workflow_suggestion.dart';
import '../services/mock_data_service.dart';
import '../services/workflow_engine.dart';
import 'home_tab.dart';
import 'medications_tab.dart';
import 'workflows_tab.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int selectedIndex = 0;

  late List<MedicineTemplate> medicineTemplates;
  final List<UserMedication> userMedications = [];

  TimingWorkflow? activeTimingWorkflow;
  HydrationWorkflow? activeHydrationWorkflow;
  Medication? latestMedication;

  String? latestSummary;
  WorkflowSuggestion? latestSuggestion;
  CareState? latestCareState;
  List<ActiveWorkflow> activeWorkflows = [];

  @override
  void initState() {
    super.initState();
    medicineTemplates = MockDataService.getMedicineTemplates();
  }

  Future<void> openAddMedicationScreen() async {
    final result = await Navigator.push<UserMedication>(
      context,
      MaterialPageRoute(
        builder: (_) => AddMedicationScreen(
          templates: medicineTemplates,
        ),
      ),
    );

    if (result != null) {
      setState(() {
        userMedications.add(result);
      });

      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${result.template.name} added with daily reminder at ${result.reminderTimeLabel}',
          ),
        ),
      );
    }
  }

  void onMedicationTaken(UserMedication userMedication) {
    final medication = Medication(
      id: userMedication.id,
      name: userMedication.template.name,
      dosage: userMedication.template.dosage,
      time: userMedication.reminderTimeLabel,
      instructions: userMedication.template.userWhatHappened,
      workflowType: userMedication.template.workflowType,
      waitBeforeMealSeconds: userMedication.template.waitBeforeMealSeconds,
      autoStartWorkflow: userMedication.template.autoStartWorkflow,
      userHeadline: userMedication.template.userHeadline,
      userWhatHappened: userMedication.template.userWhatHappened,
      userWhatMattersNow: userMedication.template.userWhatMattersNow,
      userNextAction: userMedication.template.userNextAction,
    );

    final result = WorkflowEngine.processMedicationTaken(medication);

    TimingWorkflow? timingWorkflow;

    if (medication.workflowType == 'timing_sensitive' &&
        medication.autoStartWorkflow) {
      timingWorkflow = TimingWorkflowService.createFromMedication(medication);

      Future.delayed(
        timingWorkflow.eatAfter.difference(DateTime.now()),
        () async {
          await NotificationService.showTimingReadyNotification(
            medicationName: medication.name,
          );
          if (mounted) {
            setState(() {});
          }
        },
      );
    }

    setState(() {
      latestMedication = medication;
      latestSummary = result.nextStepSummary;
      latestSuggestion = result.suggestion;
      latestCareState = result.careState;
      activeTimingWorkflow = timingWorkflow;
      selectedIndex = 0;
    });
  }

  void startHydrationRoutine() {
    if (latestMedication == null) return;

    final workflow = HydrationWorkflowService.create(
      medicationName: latestMedication!.name,
    );

    setState(() {
      activeHydrationWorkflow = workflow;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Hydration routine started')),
    );
  }

  void logHydrationGlass() {
    if (activeHydrationWorkflow == null) return;

    final updated =
        HydrationWorkflowService.logOneGlass(activeHydrationWorkflow!);

    setState(() {
      activeHydrationWorkflow = updated;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          updated.isCompleted
              ? 'Hydration goal completed for today'
              : 'Logged 1 glass',
        ),
      ),
    );
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
      const SnackBar(content: Text('Workflow activated')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeTab(
        latestMedication: latestMedication,
        latestSuggestion: latestSuggestion,
        onActivateWorkflow: activateWorkflow,
        activeWorkflowCount: activeWorkflows.length,
        latestCareState: latestCareState,
        activeTimingWorkflow: activeTimingWorkflow,
        activeHydrationWorkflow: activeHydrationWorkflow,
        onStartHydrationRoutine: startHydrationRoutine,
        onLogHydrationGlass: logHydrationGlass,
      ),
      MedicationsTab(
        medications: userMedications,
        onMedicationTaken: onMedicationTaken,
        onAddMedication: openAddMedicationScreen,
      ),
      WorkflowsTab(
        activeWorkflows: activeWorkflows,
      ),
      MealsTab(
        careState: latestCareState,
        latestMedication: latestMedication,
        activeTimingWorkflow: activeTimingWorkflow,
        activeHydrationWorkflow: activeHydrationWorkflow,
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: pages[selectedIndex],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.medication_outlined),
            selectedIcon: Icon(Icons.medication),
            label: 'Meds',
          ),
          NavigationDestination(
            icon: Icon(Icons.sync_alt_outlined),
            selectedIcon: Icon(Icons.sync_alt),
            label: 'Workflows',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_menu_outlined),
            selectedIcon: Icon(Icons.restaurant_menu),
            label: 'Meals',
          ),
        ],
      ),
    );
  }
}
