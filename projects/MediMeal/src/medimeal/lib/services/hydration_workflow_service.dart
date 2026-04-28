import '../models/hydration_workflow.dart';

class HydrationWorkflowService {
  static HydrationWorkflow create({
    required String medicationName,
  }) {
    return HydrationWorkflow(
      sourceMedicationName: medicationName,
      goalGlasses: 6,
      completedGlasses: 0,
      isActive: true,
    );
  }

  static HydrationWorkflow logOneGlass(HydrationWorkflow workflow) {
    final nextCount = workflow.completedGlasses + 1;

    return workflow.copyWith(
      completedGlasses:
          nextCount > workflow.goalGlasses ? workflow.goalGlasses : nextCount,
      isActive: nextCount >= workflow.goalGlasses ? false : workflow.isActive,
    );
  }

  static String buildProgressLabel(HydrationWorkflow workflow) {
    return '${workflow.completedGlasses} / ${workflow.goalGlasses} glasses';
  }
}
