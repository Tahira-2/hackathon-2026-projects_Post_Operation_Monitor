import '../models/meal_impact_result.dart';
import '../models/weekly_ingredient_preview_result.dart';
import '../models/weekly_tracking_workflow.dart';

class WeeklyMealImpactService {
  static const Map<String, int> trackedIngredientScores = {
    'beef': 10,
    'lamb': 10,
    'pork': 8,
    'liver': 15,
    'sardines': 12,
    'anchovies': 12,
    'shellfish': 10,
    'shrimp': 8,
    'mussels': 10,
  };

  static MealImpactResult evaluate(List<String> ingredientsUsed) {
    int total = 0;
    final tracked = <String>[];

    for (final ingredient in ingredientsUsed) {
      final normalized = ingredient.trim().toLowerCase();
      final score = trackedIngredientScores[normalized];
      if (score != null) {
        total += score;
        tracked.add(ingredient);
      }
    }

    final summary = tracked.isEmpty
        ? 'This meal did not add to your weekly tracked score.'
        : 'This meal added $total points based on: ${tracked.join(', ')}.';

    return MealImpactResult(
      addedScore: total,
      trackedIngredients: tracked,
      summary: summary,
    );
  }

  static WeeklyIngredientPreviewResult previewForGeneration({
    required List<String> ingredients,
    required WeeklyTrackingWorkflow workflow,
  }) {
    final safeIngredients = <String>[];
    final flaggedIngredients = <String>[];

    int addedScoreIfSafe = 0;
    int addedScoreIfAll = 0;

    final remaining = workflow.remaining <= 0 ? 0 : workflow.remaining;

    for (final ingredient in ingredients) {
      final normalized = ingredient.trim().toLowerCase();
      final score = trackedIngredientScores[normalized] ?? 0;

      if (score == 0) {
        safeIngredients.add(ingredient);
        continue;
      }

      addedScoreIfAll += score;

      if (remaining == 0) {
        flaggedIngredients.add(ingredient);
        continue;
      }

      if (addedScoreIfSafe + score <= remaining) {
        safeIngredients.add(ingredient);
        addedScoreIfSafe += score;
      } else {
        flaggedIngredients.add(ingredient);
      }
    }

    String warningMessage = '';
    if (flaggedIngredients.isNotEmpty) {
      if (workflow.isExceeded) {
        warningMessage =
            'You already reached this week’s limit. These ingredients would make it harder to stay within your plan: ${flaggedIngredients.join(', ')}.';
      } else {
        warningMessage =
            'These ingredients would push you over this week’s remaining allowance: ${flaggedIngredients.join(', ')}.';
      }
    }

    return WeeklyIngredientPreviewResult(
      safeIngredients: safeIngredients,
      flaggedIngredients: flaggedIngredients,
      addedScoreIfSafe: addedScoreIfSafe,
      addedScoreIfAll: addedScoreIfAll,
      warningMessage: warningMessage,
    );
  }
}
