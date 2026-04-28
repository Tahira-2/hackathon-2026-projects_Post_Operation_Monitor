class WeeklyIngredientPreviewResult {
  final List<String> safeIngredients;
  final List<String> flaggedIngredients;
  final int addedScoreIfSafe;
  final int addedScoreIfAll;
  final String warningMessage;

  const WeeklyIngredientPreviewResult({
    required this.safeIngredients,
    required this.flaggedIngredients,
    required this.addedScoreIfSafe,
    required this.addedScoreIfAll,
    required this.warningMessage,
  });

  bool get hasFlaggedIngredients => flaggedIngredients.isNotEmpty;
}
