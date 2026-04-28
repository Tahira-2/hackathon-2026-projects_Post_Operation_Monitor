import 'package:medimeal/models/medications.dart';

import '../models/care_state.dart';

import '../models/workflow_suggestion.dart';

class WorkflowResult {
  final String nextStepSummary;
  final WorkflowSuggestion? suggestion;
  final CareState careState;

  WorkflowResult({
    required this.nextStepSummary,
    required this.suggestion,
    required this.careState,
  });
}

class WorkflowEngine {
  static WorkflowResult processMedicationTaken(Medication medication) {
    switch (medication.workflowType) {
      case 'timing_sensitive':
        return WorkflowResult(
          nextStepSummary:
              'You logged ${medication.name}. A timing-aware follow-up window is now active.',
          suggestion: WorkflowSuggestion(
            title: 'Set meal timing reminder',
            description:
                'Would you like the app to create a reminder for the next recommended meal window?',
            actionLabel: 'Set Reminder',
          ),
          careState: CareState(
            summary: 'Timing-sensitive care flow active.',
            caution:
                'Your next meal suggestion should align with the current timing window.',
            weeklyUsage: 0,
            weeklyLimit: 0,
          ),
        );

      case 'hydration_support':
        return WorkflowResult(
          nextStepSummary:
              'You logged ${medication.name}. A daily support routine can help you stay on track.',
          suggestion: WorkflowSuggestion(
            title: 'Start support routine',
            description:
                'Would you like the app to activate a simple support workflow for today?',
            actionLabel: 'Start Workflow',
          ),
          careState: CareState(
            summary: 'Support routine available.',
            caution:
                'Today’s guidance can include lighter meal suggestions and adherence support.',
            weeklyUsage: 0,
            weeklyLimit: 0,
          ),
        );

      case 'weekly_limit_tracking':
        return WorkflowResult(
          nextStepSummary:
              'You logged ${medication.name}. Adaptive weekly food tracking is now active.',
          suggestion: WorkflowSuggestion(
            title: 'Track weekly limit',
            description:
                'Would you like the app to adjust future meal suggestions based on this week’s tracked intake?',
            actionLabel: 'Enable Tracking',
          ),
          careState: CareState(
            summary: 'Adaptive weekly tracker active.',
            caution:
                'Future meal suggestions may become more restrictive as your tracked weekly intake increases.',
            weeklyUsage: 20,
            weeklyLimit: 30,
          ),
        );

      default:
        return WorkflowResult(
          nextStepSummary: 'You logged ${medication.name}.',
          suggestion: null,
          careState: CareState(
            summary: 'No active workflow.',
            caution: '',
            weeklyUsage: 0,
            weeklyLimit: 0,
          ),
        );
    }
  }
}
