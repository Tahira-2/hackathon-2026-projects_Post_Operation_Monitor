class MealPlan {
  final bool canGenerateRecipe;
  final String title;
  final String summary;
  final List<String> ingredientsUsed;
  final List<String> blockedIngredients;
  final String warning;
  final List<String> steps;
  final List<String> whyIngredientsFit;
  final List<String> whyIngredientsWereBlocked;
  final String timingMessage;

  MealPlan({
    required this.canGenerateRecipe,
    required this.title,
    required this.summary,
    required this.ingredientsUsed,
    required this.blockedIngredients,
    required this.warning,
    required this.steps,
    required this.whyIngredientsFit,
    required this.whyIngredientsWereBlocked,
    required this.timingMessage,
  });

  static List<String> _safeStringList(dynamic value) {
    if (value == null) return [];

    if (value is List) {
      return value.map((item) {
        if (item is String) return item;
        if (item is Map) {
          // Convert maps into a readable one-line string
          return item.entries.map((e) => '${e.key}: ${e.value}').join(', ');
        }
        return item.toString();
      }).toList();
    }

    if (value is String) return [value];

    return [value.toString()];
  }

  factory MealPlan.fromJson(Map<String, dynamic> json) {
    return MealPlan(
      canGenerateRecipe: json['canGenerateRecipe'] ?? false,
      title: (json['title'] ?? '').toString(),
      summary: (json['summary'] ?? '').toString(),
      ingredientsUsed: _safeStringList(json['ingredientsUsed']),
      blockedIngredients: _safeStringList(json['blockedIngredients']),
      warning: (json['warning'] ?? '').toString(),
      steps: _safeStringList(json['steps']),
      whyIngredientsFit: _safeStringList(json['whyIngredientsFit']),
      whyIngredientsWereBlocked:
          _safeStringList(json['whyIngredientsWereBlocked']),
      timingMessage: (json['timingMessage'] ?? '').toString(),
    );
  }
}
