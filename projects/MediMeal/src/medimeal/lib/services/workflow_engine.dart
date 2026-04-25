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
              'You logged ${medication.name}. A timing-based follow-up is now active.',
          suggestion: WorkflowSuggestion(
            title: 'Set next-step reminder',
            description:
                'Would you like the app to create a reminder for the next recommended action window?',
            actionLabel: 'Set Reminder',
          ),
          careState: CareState(
            summary: 'Timing-sensitive workflow active.',
            caution:
                'Your next meal/action should follow the recommended timing window.',
            weeklyUsage: 0,
            weeklyLimit: 0,
          ),
        );

      case 'hydration_support':
        return WorkflowResult(
          nextStepSummary:
              'You logged ${medication.name}. A support routine may help you stay on track today.',
          suggestion: WorkflowSuggestion(
            title: 'Start support workflow',
            description:
                'Would you like the app to set up a spaced reminder routine for today?',
            actionLabel: 'Start Workflow',
          ),
          careState: CareState(
            summary: 'Support workflow available.',
            caution: 'A daily support routine can now be activated.',
            weeklyUsage: 0,
            weeklyLimit: 0,
          ),
        );

      case 'weekly_limit_tracking':
        return WorkflowResult(
          nextStepSummary:
              'You logged ${medication.name}. Weekly tracking has been updated.',
          suggestion: WorkflowSuggestion(
            title: 'View adaptive recommendations',
            description:
                'Future suggestions can now adjust based on this week’s tracked usage.',
            actionLabel: 'View Tracker',
          ),
          careState: CareState(
            summary: 'Weekly tracker active.',
            caution:
                'Future meal guidance may change based on tracked weekly usage.',
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
