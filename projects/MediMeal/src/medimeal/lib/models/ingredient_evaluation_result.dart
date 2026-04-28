class IngredientEvaluationResult {
  final List<String> originalIngredients;
  final List<String> allowedIngredients;
  final List<String> blockedIngredients;
  final Map<String, String> blockedReasons;
  final String warning;
  final bool hasAnyAllowedIngredients;

  IngredientEvaluationResult({
    required this.originalIngredients,
    required this.allowedIngredients,
    required this.blockedIngredients,
    required this.blockedReasons,
    required this.warning,
    required this.hasAnyAllowedIngredients,
  });
}
