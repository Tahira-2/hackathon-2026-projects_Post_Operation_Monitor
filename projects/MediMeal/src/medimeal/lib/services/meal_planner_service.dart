import '../models/care_state.dart';
import '../models/meal_plan.dart';

class MealPlannerService {
  static MealPlan generateMockMealPlan({
    required String ingredientsText,
    required String mealType,
    CareState? careState,
  }) {
    final ingredients = ingredientsText
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();

    final title = ingredients.isEmpty
        ? '$mealType Care Bowl'
        : '$mealType with ${ingredients.take(2).join(' & ')}';

    final careSummary = careState?.summary ?? 'general care support';
    final careWarning = careState?.caution ?? '';

    return MealPlan(
      canGenerateRecipe: true,
      title: title,
      summary:
          'A simple $mealType suggestion based on your available ingredients and current care context.',
      ingredientsUsed: ingredients.isEmpty
          ? ['rice', 'vegetables', 'protein source']
          : ingredients,
      blockedIngredients: [],
      warning: '',
      steps: [
        'Prepare the available ingredients.',
        'Combine them into a simple balanced $mealType.',
        'Keep the meal aligned with your current care timing and workflow.',
      ],
      whyIngredientsFit: [
        'These ingredients were kept because they fit the current care context.',
        if (careSummary.isNotEmpty) 'Current care context: $careSummary',
      ],
      whyIngredientsWereBlocked: [],
      timingMessage: careWarning.isNotEmpty
          ? careWarning
          : 'This meal suggestion fits the current care context.',
    );
  }
}
