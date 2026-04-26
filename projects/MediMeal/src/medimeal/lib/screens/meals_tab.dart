import 'dart:async';
import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../models/hydration_workflow.dart';
import '../models/ingredient_evaluation_result.dart';
import '../models/meal_plan.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';
import '../models/weekly_tracking_workflow.dart';
import '../services/gemini_meal_service.dart';
import '../services/ingredient_evaluator_service.dart';
import '../services/hydration_workflow_service.dart';
import '../services/timing_workflow_service.dart';
import '../services/weekly_tracking_workflow_service.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';

class MealsTab extends StatefulWidget {
  final CareState? careState;
  final Medication? latestMedication;
  final TimingWorkflow? activeTimingWorkflow;
  final HydrationWorkflow? activeHydrationWorkflow;
  final WeeklyTrackingWorkflow? activeWeeklyTrackingWorkflow;
  final void Function(MealPlan)? onLogMealForWeeklyTracking;

  const MealsTab({
    super.key,
    required this.careState,
    required this.latestMedication,
    required this.activeTimingWorkflow,
    required this.activeHydrationWorkflow,
    required this.activeWeeklyTrackingWorkflow,
    required this.onLogMealForWeeklyTracking,
  });

  @override
  State<MealsTab> createState() => _MealsTabState();
}

class _MealsTabState extends State<MealsTab> {
  final TextEditingController ingredientsController = TextEditingController();

  String selectedMealType = 'Breakfast';
  MealPlan? generatedMealPlan;
  bool isLoading = false;
  String? errorMessage;
  Timer? _timer;

  final List<String> mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  @override
  void initState() {
    super.initState();
    _startTimerIfNeeded();
  }

  @override
  void didUpdateWidget(covariant MealsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    _startTimerIfNeeded();
  }

  void _startTimerIfNeeded() {
    _timer?.cancel();

    final workflow = widget.activeTimingWorkflow;
    if (workflow != null && workflow.isActive) {
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (!mounted) return;

        if (widget.activeTimingWorkflow == null ||
            !widget.activeTimingWorkflow!.isActive) {
          timer.cancel();
        } else {
          setState(() {});
        }
      });
    }
  }

  Future<void> generateMealPlan() async {
    if (ingredientsController.text.trim().isEmpty) {
      setState(() {
        errorMessage = 'Please enter at least one ingredient.';
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
      generatedMealPlan = null;
    });

    try {
      final bool isTimingActive = widget.activeTimingWorkflow != null &&
          widget.activeTimingWorkflow!.isActive;

      final String timingNote = isTimingActive
          ? '${TimingWorkflowService.formatRemaining(widget.activeTimingWorkflow!.remainingTime)} This recipe is for preparation now and eating later when the meal window opens.'
          : 'The meal window is open. This recipe can be eaten now.';

      final String supportNote = widget.activeHydrationWorkflow != null
          ? 'Hydration routine is active. Prefer simple, supportive, easy-to-follow meals for today.'
          : '';

      final String weeklyNote = widget.activeWeeklyTrackingWorkflow != null
          ? 'Weekly tracking is active. The recipe should respect the remaining allowance for this week and avoid pushing the user over the limit.'
          : '';

      final IngredientEvaluationResult evaluation =
          IngredientEvaluatorService.evaluate(
        ingredientsText: ingredientsController.text,
        latestMedication: widget.latestMedication,
        activeTimingWorkflow: widget.activeTimingWorkflow,
      );

      final mealPlan = await GeminiMealService.generateMealPlan(
        mealType: selectedMealType,
        timingNote: timingNote,
        evaluation: evaluation,
        careState: widget.careState,
        latestMedication: widget.latestMedication,
        supportNote: supportNote,
        weeklyNote: weeklyNote,
      );

      setState(() {
        generatedMealPlan = mealPlan;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Widget _buildAlertBanner({
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
        border: Border.all(
          color: accentColor.withOpacity(0.35),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: accentColor,
            size: 22,
          ),
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

  Widget _buildStatusCard() {
    if (widget.activeTimingWorkflow != null &&
        widget.activeTimingWorkflow!.isActive) {
      return _buildAlertBanner(
        icon: Icons.schedule,
        title: 'Wait before eating',
        message:
            '${TimingWorkflowService.formatRemaining(widget.activeTimingWorkflow!.remainingTime)} Meal window opens at ${TimingWorkflowService.formatAllowedTime(widget.activeTimingWorkflow!.eatAfter)}.',
        backgroundColor: const Color(0xFF3B2A12),
        accentColor: const Color(0xFFFBBF24),
        textColor: const Color(0xFFE5E7EB),
      );
    }

    if (widget.activeTimingWorkflow != null &&
        !widget.activeTimingWorkflow!.isActive) {
      return _buildAlertBanner(
        icon: Icons.check_circle_outline,
        title: 'Meal window open',
        message: 'You can now generate a recipe for immediate eating.',
        backgroundColor: const Color(0xFF123227),
        accentColor: const Color(0xFF34D399),
        textColor: const Color(0xFFE5E7EB),
      );
    }

    if (widget.activeHydrationWorkflow != null) {
      return _buildAlertBanner(
        icon: Icons.water_drop_outlined,
        title: 'Hydration routine active',
        message:
            '${HydrationWorkflowService.buildProgressLabel(widget.activeHydrationWorkflow!)}. Choose a simple meal that supports the rest of today’s routine.',
        backgroundColor: const Color(0xFF102A43),
        accentColor: const Color(0xFF60A5FA),
        textColor: const Color(0xFFE5E7EB),
      );
    }

    if (widget.activeWeeklyTrackingWorkflow != null) {
      final weekly = widget.activeWeeklyTrackingWorkflow!;
      return _buildAlertBanner(
        icon: weekly.isExceeded
            ? Icons.error_outline
            : weekly.isNearLimit
                ? Icons.warning_amber_rounded
                : Icons.insights_outlined,
        title: weekly.isExceeded
            ? 'Weekly limit reached'
            : weekly.isNearLimit
                ? 'Weekly limit almost reached'
                : 'Weekly tracking active',
        message: weekly.isExceeded
            ? '${WeeklyTrackingWorkflowService.buildProgressLabel(weekly)}. Choose meals that avoid tracked ingredients now.'
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
      );
    }

    return const SummaryCard(
      text: 'Log a medication first to get care-aware meal guidance.',
    );
  }

  Widget _buildMealInputCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ingredients',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: ingredientsController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Example: rice, spinach, eggs',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Meal Type',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: selectedMealType,
              items: mealTypes
                  .map(
                    (type) => DropdownMenuItem(
                      value: type,
                      child: Text(type),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    selectedMealType = value;
                  });
                }
              },
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: isLoading ? null : generateMealPlan,
              child: Text(isLoading ? 'Generating...' : 'Generate Meal Plan'),
            ),
          ],
        ),
      ),
    );
  }

  void _showRecipeBottomSheet() {
    if (generatedMealPlan == null) return;

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
                Text(
                  generatedMealPlan!.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  generatedMealPlan!.summary,
                  style: const TextStyle(
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Ingredients Used',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                ...generatedMealPlan!.ingredientsUsed.map(
                  (ingredient) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
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
                ...generatedMealPlan!.steps.map(
                  (step) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      '• $step',
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

  void _showIngredientNotesBottomSheet() {
    if (generatedMealPlan == null) return;

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
                const Text(
                  'Ingredient Notes',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                if (generatedMealPlan!.whyIngredientsFit.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Why these ingredients fit',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.whyIngredientsFit.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
                if (generatedMealPlan!
                    .whyIngredientsWereBlocked.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Why some ingredients were not used',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.whyIngredientsWereBlocked.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '• $item',
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
                ],
                if (generatedMealPlan!.blockedIngredients.isNotEmpty) ...[
                  const SizedBox(height: 18),
                  const Text(
                    'Ingredients not used',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...generatedMealPlan!.blockedIngredients.map(
                    (ingredient) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
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

  Widget _buildGeneratedMealCard() {
    if (generatedMealPlan == null) {
      return const SummaryCard(
        text: 'No meal generated yet. Add ingredients and generate a plan.',
      );
    }

    final bool hasTimingAlert = generatedMealPlan!.timingMessage.isNotEmpty;
    final bool hasIngredientWarning = generatedMealPlan!.warning.isNotEmpty;
    final bool hasBlockedIngredients =
        generatedMealPlan!.blockedIngredients.isNotEmpty;
    final bool hasWeeklyTracking = widget.activeWeeklyTrackingWorkflow != null;

    return Card(
      key: ValueKey(
        '${generatedMealPlan!.title}-${generatedMealPlan!.warning}-${generatedMealPlan!.timingMessage}',
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              generatedMealPlan!.title,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              generatedMealPlan!.summary,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.4,
              ),
            ),
            if (hasTimingAlert) ...[
              const SizedBox(height: 14),
              _buildAlertBanner(
                icon: Icons.schedule,
                title: 'Timing reminder',
                message: generatedMealPlan!.timingMessage,
                backgroundColor: const Color(0xFF3B2A12),
                accentColor: const Color(0xFFFBBF24),
                textColor: const Color(0xFFE5E7EB),
              ),
            ],
            if (hasIngredientWarning) ...[
              const SizedBox(height: 14),
              _buildAlertBanner(
                icon: Icons.warning_amber_rounded,
                title: 'Ingredient warning',
                message: generatedMealPlan!.warning,
                backgroundColor: const Color(0xFF3B2A12),
                accentColor: const Color(0xFFFBBF24),
                textColor: const Color(0xFFE5E7EB),
              ),
            ],
            if (hasBlockedIngredients) ...[
              const SizedBox(height: 14),
              _buildAlertBanner(
                icon: Icons.do_not_disturb_alt_outlined,
                title: 'Ingredients not used',
                message: generatedMealPlan!.blockedIngredients.join(', '),
                backgroundColor: const Color(0xFF3F1D1D),
                accentColor: const Color(0xFFF87171),
                textColor: const Color(0xFFFECACA),
              ),
            ],
            if (hasWeeklyTracking) ...[
              const SizedBox(height: 14),
              _buildAlertBanner(
                icon: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? Icons.error_outline
                    : widget.activeWeeklyTrackingWorkflow!.isNearLimit
                        ? Icons.warning_amber_rounded
                        : Icons.insights_outlined,
                title: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? 'Weekly limit reached'
                    : widget.activeWeeklyTrackingWorkflow!.isNearLimit
                        ? 'Weekly limit almost reached'
                        : 'Weekly tracking',
                message: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? '${WeeklyTrackingWorkflowService.buildProgressLabel(widget.activeWeeklyTrackingWorkflow!)} • Choose meals that avoid tracked ingredients now.'
                    : '${WeeklyTrackingWorkflowService.buildProgressLabel(widget.activeWeeklyTrackingWorkflow!)} • ${WeeklyTrackingWorkflowService.buildRemainingLabel(widget.activeWeeklyTrackingWorkflow!)}',
                backgroundColor: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? const Color(0xFF3F1D1D)
                    : widget.activeWeeklyTrackingWorkflow!.isNearLimit
                        ? const Color(0xFF3B2A12)
                        : const Color(0xFF2E1065),
                accentColor: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? const Color(0xFFF87171)
                    : widget.activeWeeklyTrackingWorkflow!.isNearLimit
                        ? const Color(0xFFFBBF24)
                        : const Color(0xFFC084FC),
                textColor: widget.activeWeeklyTrackingWorkflow!.isExceeded
                    ? const Color(0xFFFECACA)
                    : widget.activeWeeklyTrackingWorkflow!.isNearLimit
                        ? const Color(0xFFE5E7EB)
                        : const Color(0xFFE9D5FF),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _showRecipeBottomSheet,
                    child: const Text('View Recipe'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _showIngredientNotesBottomSheet,
                    child: const Text('Ingredient Notes'),
                  ),
                ),
              ],
            ),
            if (widget.activeWeeklyTrackingWorkflow != null &&
                generatedMealPlan!.canGenerateRecipe) ...[
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: widget.onLogMealForWeeklyTracking == null
                    ? null
                    : () =>
                        widget.onLogMealForWeeklyTracking!(generatedMealPlan!),
                child: const Text('Log This Meal'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    ingredientsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final String topContextText = widget.latestMedication == null
        ? 'No active care guidance yet'
        : (widget.activeTimingWorkflow != null &&
                widget.activeTimingWorkflow!.isActive)
            ? 'Your next recipe is for later'
            : (widget.activeHydrationWorkflow != null)
                ? 'Your next recipe should feel simple and supportive today'
                : (widget.activeWeeklyTrackingWorkflow != null)
                    ? 'Your next recipe should fit within this week’s remaining allowance'
                    : 'You can plan your meal now';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Meals',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Generate care-aware meal suggestions',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Right now'),
          SummaryCard(text: topContextText),
          const SizedBox(height: 24),
          _buildStatusCard(),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Meal Inputs'),
          _buildMealInputCard(),
          const SizedBox(height: 16),
          if (errorMessage != null) ...[
            Card(
              color: const Color(0xFF3F1D1D),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.redAccent,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        errorMessage!,
                        style: const TextStyle(
                          color: Color(0xFFFECACA),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          const SectionTitle(title: 'Suggested Meal'),
          _buildGeneratedMealCard(),
        ],
      ),
    );
  }
}
