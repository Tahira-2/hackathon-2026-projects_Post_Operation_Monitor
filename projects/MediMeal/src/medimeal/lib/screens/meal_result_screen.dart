import 'package:flutter/material.dart';

import '../models/ingredient_evaluation_result.dart';
import '../models/meal_plan.dart';
import '../models/timing_workflow.dart';
import '../models/weekly_ingredient_preview_result.dart';
import '../models/weekly_tracking_workflow.dart';

import '../services/timing_workflow_service.dart';

import '../services/weekly_tracking_workflow_service.dart';

class MealResultScreen extends StatelessWidget {
  final MealPlan mealPlan;
  final TimingWorkflow? activeTimingWorkflow;
  final WeeklyTrackingWorkflow? activeWeeklyTrackingWorkflow;
  final WeeklyIngredientPreviewResult? latestWeeklyPreview;
  final IngredientEvaluationResult? latestEvaluationResult;
  final VoidCallback? onGenerateSaferVersion;
  final void Function(List<String>)? onLogMealForWeeklyTracking;

  const MealResultScreen({
    super.key,
    required this.mealPlan,
    required this.activeTimingWorkflow,
    required this.activeWeeklyTrackingWorkflow,
    required this.latestWeeklyPreview,
    required this.latestEvaluationResult,
    required this.onGenerateSaferVersion,
    required this.onLogMealForWeeklyTracking,
  });

  Widget _alertBanner({
    required IconData icon,
    required String title,
    required String message,
    required Color backgroundColor,
    required Color accentColor,
    required Color textColor,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accentColor.withOpacity(0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: accentColor, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: accentColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  message,
                  style: TextStyle(
                    color: textColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showRecipeBottomSheet(BuildContext context) {
    final bool canEatNow =
        activeTimingWorkflow == null || !activeTimingWorkflow!.isActive;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _alertBanner(
                  icon: canEatNow ? Icons.check_circle_outline : Icons.schedule,
                  title: canEatNow ? 'Ready to eat' : 'Prepare now, eat later',
                  message: canEatNow
                      ? 'This meal fits your current care context and can be eaten now.'
                      : 'This meal can be prepared now, but eating should wait until your meal window opens.',
                  backgroundColor: canEatNow
                      ? const Color(0xFF123227)
                      : const Color(0xFF3B2A12),
                  accentColor: canEatNow
                      ? const Color(0xFF34D399)
                      : const Color(0xFFFBBF24),
                  textColor: const Color(0xFFE5E7EB),
                ),
                const SizedBox(height: 18),
                Text(
                  mealPlan.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  mealPlan.summary,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Ingredients used',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                ...mealPlan.ingredientsUsed.map(
                  (ingredient) => Padding(
                    padding: const EdgeInsets.only(bottom: 5),
                    child: Text(
                      '• $ingredient',
                      style: const TextStyle(color: Color(0xFFCBD5E1)),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Steps',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                ...mealPlan.steps.asMap().entries.map(
                      (entry) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          '${entry.key + 1}. ${entry.value}',
                          style: const TextStyle(
                            color: Color(0xFFCBD5E1),
                            height: 1.4,
                          ),
                        ),
                      ),
                    ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showIngredientNotesBottomSheet(BuildContext context) {
    final bool nothingBlocked = mealPlan.blockedIngredients.isEmpty &&
        mealPlan.whyIngredientsWereBlocked.isEmpty &&
        mealPlan.warning.trim().isEmpty;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (nothingBlocked)
                  _alertBanner(
                    icon: Icons.check_circle_outline,
                    title: 'Nothing was blocked',
                    message:
                        'All selected ingredients were used for your current care context.',
                    backgroundColor: const Color(0xFF123227),
                    accentColor: const Color(0xFF34D399),
                    textColor: const Color(0xFFE5E7EB),
                  )
                else
                  _alertBanner(
                    icon: Icons.warning_amber_rounded,
                    title: 'Some ingredients were removed',
                    message: mealPlan.warning.isNotEmpty
                        ? mealPlan.warning
                        : 'Some selected ingredients were not used for this meal.',
                    backgroundColor: const Color(0xFF3B2A12),
                    accentColor: const Color(0xFFFBBF24),
                    textColor: const Color(0xFFE5E7EB),
                  ),
                const SizedBox(height: 18),
                if (mealPlan.whyIngredientsFit.isNotEmpty) ...[
                  const Text(
                    'Why this meal works',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...mealPlan.whyIngredientsFit.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 7),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                if (mealPlan.whyIngredientsWereBlocked.isNotEmpty) ...[
                  const Text(
                    'Why some ingredients were removed',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...mealPlan.whyIngredientsWereBlocked.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 7),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                if (mealPlan.ingredientsUsed.isNotEmpty) ...[
                  const Text(
                    'Used ingredients',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...mealPlan.ingredientsUsed.map(
                    (ingredient) => Padding(
                      padding: const EdgeInsets.only(bottom: 5),
                      child: Text(
                        '• $ingredient',
                        style: const TextStyle(color: Color(0xFFCBD5E1)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                if (mealPlan.blockedIngredients.isNotEmpty) ...[
                  const Text(
                    'Removed ingredients',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...mealPlan.blockedIngredients.map(
                    (ingredient) => Padding(
                      padding: const EdgeInsets.only(bottom: 5),
                      child: Text(
                        '• $ingredient',
                        style: const TextStyle(color: Color(0xFFCBD5E1)),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  List<Widget> _buildTopAlerts() {
    final alerts = <Widget>[];

    if (mealPlan.timingMessage.isNotEmpty) {
      final bool waiting =
          activeTimingWorkflow != null && activeTimingWorkflow!.isActive;

      alerts.add(
        _alertBanner(
          icon: waiting ? Icons.schedule : Icons.check_circle_outline,
          title: waiting ? 'Wait before eating' : 'Meal window open',
          message: mealPlan.timingMessage,
          backgroundColor:
              waiting ? const Color(0xFF3B2A12) : const Color(0xFF123227),
          accentColor:
              waiting ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
          textColor: const Color(0xFFE5E7EB),
        ),
      );
    }

    if (mealPlan.warning.isNotEmpty) {
      alerts.add(
        _alertBanner(
          icon: Icons.warning_amber_rounded,
          title: 'Ingredient warning',
          message: mealPlan.warning,
          backgroundColor: const Color(0xFF3B2A12),
          accentColor: const Color(0xFFFBBF24),
          textColor: const Color(0xFFE5E7EB),
        ),
      );
    }

    if (mealPlan.blockedIngredients.isNotEmpty) {
      alerts.add(
        _alertBanner(
          icon: Icons.do_not_disturb_alt_outlined,
          title: 'Ingredients not used',
          message: mealPlan.blockedIngredients.join(', '),
          backgroundColor: const Color(0xFF3F1D1D),
          accentColor: const Color(0xFFF87171),
          textColor: const Color(0xFFFECACA),
        ),
      );
    }

    if (activeWeeklyTrackingWorkflow != null) {
      final weekly = activeWeeklyTrackingWorkflow!;
      alerts.add(
        _alertBanner(
          icon: weekly.isExceeded
              ? Icons.error_outline
              : weekly.isNearLimit
                  ? Icons.warning_amber_rounded
                  : Icons.insights_outlined,
          title: weekly.isExceeded
              ? 'Weekly limit reached'
              : weekly.isNearLimit
                  ? 'Weekly limit almost reached'
                  : 'Weekly tracking',
          message: weekly.isExceeded
              ? '${WeeklyTrackingWorkflowService.buildProgressLabel(weekly)} • Choose meals that avoid tracked ingredients now.'
              : '${WeeklyTrackingWorkflowService.buildProgressLabel(weekly)} • ${WeeklyTrackingWorkflowService.buildRemainingLabel(weekly)}',
          backgroundColor: weekly.isExceeded
              ? const Color(0xFF3F1D1D)
              : weekly.isNearLimit
                  ? const Color(0xFF3B2A12)
                  : const Color(0xFF2E1065),
          accentColor: weekly.isExceeded
              ? const Color(0xFFF87171)
              : weekly.isNearLimit
                  ? const Color(0xFFFBBF24)
                  : const Color(0xFFC084FC),
          textColor: weekly.isExceeded
              ? const Color(0xFFFECACA)
              : weekly.isNearLimit
                  ? const Color(0xFFE5E7EB)
                  : const Color(0xFFE9D5FF),
        ),
      );

      if (latestWeeklyPreview != null &&
          latestWeeklyPreview!.hasFlaggedIngredients) {
        alerts.add(
          _alertBanner(
            icon: Icons.remove_circle_outline,
            title: 'These ingredients are the issue',
            message: latestWeeklyPreview!.warningMessage,
            backgroundColor: const Color(0xFF3F1D1D),
            accentColor: const Color(0xFFF87171),
            textColor: const Color(0xFFFECACA),
          ),
        );
      }
    }

    return alerts;
  }

  @override
  Widget build(BuildContext context) {
    final alerts = _buildTopAlerts();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Suggested Meal'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...[
              for (int i = 0; i < alerts.length; i++) ...[
                alerts[i],
                if (i != alerts.length - 1) const SizedBox(height: 12),
              ]
            ],
            if (alerts.isNotEmpty) const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      mealPlan.title,
                      style: const TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      mealPlan.summary,
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _showRecipeBottomSheet(context),
                            child: const Text('View Recipe'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () =>
                                _showIngredientNotesBottomSheet(context),
                            child: const Text('Ingredient Notes'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (latestWeeklyPreview != null &&
                latestWeeklyPreview!.hasFlaggedIngredients) ...[
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onGenerateSaferVersion,
                  child: Text(
                    'Generate without ${latestWeeklyPreview!.flaggedIngredients.join(', ')}',
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            if (activeWeeklyTrackingWorkflow != null &&
                latestEvaluationResult != null) ...[
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onLogMealForWeeklyTracking == null
                      ? null
                      : () => onLogMealForWeeklyTracking!(
                            latestEvaluationResult!.allowedIngredients,
                          ),
                  child: const Text('Log This Meal'),
                ),
              ),
              const SizedBox(height: 12),
            ],
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Back to Edit Inputs'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
