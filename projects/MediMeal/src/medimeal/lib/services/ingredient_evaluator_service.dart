import '../models/ingredient_evaluation_result.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';

class IngredientEvaluatorService {
  static IngredientEvaluationResult evaluate({
    required String ingredientsText,
    required Medication? latestMedication,
    required TimingWorkflow? activeTimingWorkflow,
  }) {
    final ingredients = ingredientsText
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .where((e) => e.isNotEmpty)
        .toList();

    final allowed = <String>[];
    final blocked = <String>[];
    final blockedReasons = <String, String>{};

    final bool isTimingActive =
        activeTimingWorkflow != null && activeTimingWorkflow.isActive;

    for (final ingredient in ingredients) {
      if (isTimingActive) {
        // Demo rules for timing-based flow.
        // You can expand this later.
        if (ingredient == 'coffee' ||
            ingredient == 'tea' ||
            ingredient == 'milk') {
          blocked.add(ingredient);
          blockedReasons[ingredient] =
              '$ingredient is not a good fit during the current waiting window after ${latestMedication?.name ?? 'this medication'}.';
          continue;
        }
      }

      allowed.add(ingredient);
    }

    String warning = '';
    if (blocked.isNotEmpty) {
      warning =
          'Some ingredients are not a good fit right now: ${blocked.join(', ')}. The recipe will use the remaining ingredients.';
    }

    return IngredientEvaluationResult(
      originalIngredients: ingredients,
      allowedIngredients: allowed,
      blockedIngredients: blocked,
      blockedReasons: blockedReasons,
      warning: warning,
      hasAnyAllowedIngredients: allowed.isNotEmpty,
    );
  }
}
