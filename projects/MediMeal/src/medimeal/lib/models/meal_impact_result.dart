class MealImpactResult {
  final int addedScore;
  final List<String> trackedIngredients;
  final String summary;

  const MealImpactResult({
    required this.addedScore,
    required this.trackedIngredients,
    required this.summary,
  });
}
