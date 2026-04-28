import '../models/weekly_tracking_workflow.dart';

class WeeklyTrackingWorkflowService {
  static WeeklyTrackingWorkflow create({
    required String medicationName,
  }) {
    return WeeklyTrackingWorkflow(
      sourceMedicationName: medicationName,
      weeklyLimit: 30,
      usedThisWeek: 20,
      isActive: true,
    );
  }

  static WeeklyTrackingWorkflow applyMealImpact(
    WeeklyTrackingWorkflow workflow,
    int addedScore,
  ) {
    final updatedUsed = workflow.usedThisWeek + addedScore;

    return workflow.copyWith(
      usedThisWeek: updatedUsed,
      isActive: true,
    );
  }

  static String buildProgressLabel(WeeklyTrackingWorkflow workflow) {
    return '${workflow.usedThisWeek} / ${workflow.weeklyLimit} used this week';
  }

  static String buildRemainingLabel(WeeklyTrackingWorkflow workflow) {
    if (workflow.isExceeded) {
      return 'You have reached this week’s limit.';
    }
    return '${workflow.remaining} remaining this week';
  }
}
