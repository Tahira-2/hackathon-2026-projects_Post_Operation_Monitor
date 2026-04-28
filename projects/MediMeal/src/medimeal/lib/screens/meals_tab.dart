import 'dart:async';
import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../models/hydration_workflow.dart';
import '../models/ingredient_evaluation_result.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';
import '../models/weekly_ingredient_preview_result.dart';
import '../models/weekly_tracking_workflow.dart';
import '../services/gemini_meal_service.dart';
import '../services/hydration_workflow_service.dart';
import '../services/ingredient_evaluator_service.dart';
import '../services/timing_workflow_service.dart';
import '../services/weekly_meal_impact_service.dart';
import '../services/weekly_tracking_workflow_service.dart';
import '../widgets/section_title.dart';
import '../widgets/summary_card.dart';
import 'meal_result_screen.dart';

class MealsTab extends StatefulWidget {
  final CareState? careState;
  final Medication? latestMedication;
  final TimingWorkflow? activeTimingWorkflow;
  final HydrationWorkflow? activeHydrationWorkflow;
  final WeeklyTrackingWorkflow? activeWeeklyTrackingWorkflow;
  final void Function(List<String>)? onLogMealForWeeklyTracking;

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
  bool isLoading = false;
  String? errorMessage;
  Timer? _timer;

  final List<String> mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  Widget _buildHeroCard({
    required IconData icon,
    required Color accent,
    required Color bg,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [
            bg,
            bg.withOpacity(0.92),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: accent.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.16),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: accent,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 14.5,
              color: Color(0xFFD6DEEA),
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRightNowHero() {
    final timing = widget.activeTimingWorkflow;
    final hydration = widget.activeHydrationWorkflow;
    final weekly = widget.activeWeeklyTrackingWorkflow;

    if (widget.latestMedication == null &&
        timing == null &&
        hydration == null &&
        weekly == null) {
      return _buildHeroCard(
        icon: Icons.restaurant_menu,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF132238),
        title: 'No active care guidance',
        value: 'Meal planning ready',
        subtitle:
            'Add ingredients and generate a care-aware meal suggestion when you are ready.',
      );
    }

    if (timing != null && timing.isActive) {
      return _buildHeroCard(
        icon: Icons.schedule,
        accent: const Color(0xFFFBBF24),
        bg: const Color(0xFF33240E),
        title: 'Your next recipe is for later',
        value: TimingWorkflowService.formatRemaining(timing.remainingTime),
        subtitle:
            'You can prepare food now, but eating should wait until the meal window opens at ${TimingWorkflowService.formatAllowedTime(timing.eatAfter)}.',
      );
    }

    if (weekly != null && weekly.isExceeded) {
      return _buildHeroCard(
        icon: Icons.error_outline,
        accent: const Color(0xFFF87171),
        bg: const Color(0xFF341617),
        title: 'Stay under this week’s limit',
        value: WeeklyTrackingWorkflowService.buildProgressLabel(weekly),
        subtitle:
            'Your next recipe should avoid tracked ingredients until your weekly score resets.',
      );
    }

    if (weekly != null && weekly.isNearLimit) {
      return _buildHeroCard(
        icon: Icons.warning_amber_rounded,
        accent: const Color(0xFFFBBF24),
        bg: const Color(0xFF33240E),
        title: 'Choose carefully this week',
        value: WeeklyTrackingWorkflowService.buildProgressLabel(weekly),
        subtitle:
            '${WeeklyTrackingWorkflowService.buildRemainingLabel(weekly)}. A lighter meal is the better choice now.',
      );
    }

    if (hydration != null) {
      return _buildHeroCard(
        icon: Icons.water_drop_outlined,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF12283D),
        title: 'Keep today simple and supportive',
        value: HydrationWorkflowService.buildProgressLabel(hydration),
        subtitle: hydration.isCompleted
            ? 'You already completed today’s hydration goal.'
            : 'Choose a meal that feels easy to follow while you continue today’s hydration routine.',
      );
    }

    if (timing != null && !timing.isActive) {
      return _buildHeroCard(
        icon: Icons.check_circle_outline,
        accent: const Color(0xFF34D399),
        bg: const Color(0xFF132A23),
        title: 'You can plan and eat now',
        value: 'Meal window open',
        subtitle:
            'Your waiting period is over. Generate a meal you can eat right away.',
      );
    }

    return _buildHeroCard(
      icon: Icons.restaurant_menu,
      accent: const Color(0xFF60A5FA),
      bg: const Color(0xFF132238),
      title: 'Meal planning ready',
      value: selectedMealType,
      subtitle:
          'Use your current ingredients to generate a meal that fits your care context.',
    );
  }

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

  Future<void> _generateAndOpenResult() async {
    if (ingredientsController.text.trim().isEmpty) {
      setState(() {
        errorMessage = 'Please enter at least one ingredient.';
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
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

      final evaluation = IngredientEvaluatorService.evaluate(
        ingredientsText: ingredientsController.text,
        latestMedication: widget.latestMedication,
        activeTimingWorkflow: widget.activeTimingWorkflow,
      );

      WeeklyIngredientPreviewResult? weeklyPreview;
      String weeklyNote = '';

      if (widget.activeWeeklyTrackingWorkflow != null) {
        weeklyPreview = WeeklyMealImpactService.previewForGeneration(
          ingredients: evaluation.allowedIngredients,
          workflow: widget.activeWeeklyTrackingWorkflow!,
        );

        weeklyNote = weeklyPreview.hasFlaggedIngredients
            ? 'Weekly tracking is active. These ingredients would push the user over the weekly limit: ${weeklyPreview.flaggedIngredients.join(', ')}. Mention this clearly and suggest using the safer ingredients instead.'
            : 'Weekly tracking is active. The recipe should respect the remaining allowance for this week.';
      }

      final mealPlan = await GeminiMealService.generateMealPlan(
        mealType: selectedMealType,
        timingNote: timingNote,
        evaluation: evaluation,
        careState: widget.careState,
        latestMedication: widget.latestMedication,
        supportNote: supportNote,
        weeklyNote: weeklyNote,
      );

      if (!mounted) return;

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => MealResultScreen(
            mealPlan: mealPlan,
            activeTimingWorkflow: widget.activeTimingWorkflow,
            activeWeeklyTrackingWorkflow: widget.activeWeeklyTrackingWorkflow,
            latestWeeklyPreview: weeklyPreview,
            latestEvaluationResult: evaluation,
            onLogMealForWeeklyTracking: widget.onLogMealForWeeklyTracking,
            onGenerateSaferVersion:
                weeklyPreview != null && weeklyPreview.hasFlaggedIngredients
                    ? () async {
                        Navigator.pop(context);
                        ingredientsController.text =
                            weeklyPreview!.safeIngredients.join(', ');
                        await _generateAndOpenResult();
                      }
                    : null,
          ),
        ),
      );
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

  Widget _buildStatusCards() {
    final List<Widget> banners = [];

    if (widget.activeTimingWorkflow != null &&
        widget.activeTimingWorkflow!.isActive) {
      banners.add(
        _buildAlertBanner(
          icon: Icons.schedule,
          title: 'Wait before eating',
          message:
              '${TimingWorkflowService.formatRemaining(widget.activeTimingWorkflow!.remainingTime)} Meal window opens at ${TimingWorkflowService.formatAllowedTime(widget.activeTimingWorkflow!.eatAfter)}.',
          backgroundColor: const Color(0xFF3B2A12),
          accentColor: const Color(0xFFFBBF24),
          textColor: const Color(0xFFE5E7EB),
        ),
      );
    } else if (widget.activeTimingWorkflow != null &&
        !widget.activeTimingWorkflow!.isActive) {
      banners.add(
        _buildAlertBanner(
          icon: Icons.check_circle_outline,
          title: 'Meal window open',
          message: 'You can now generate a recipe for immediate eating.',
          backgroundColor: const Color(0xFF123227),
          accentColor: const Color(0xFF34D399),
          textColor: const Color(0xFFE5E7EB),
        ),
      );
    }

    if (widget.activeHydrationWorkflow != null) {
      banners.add(
        _buildAlertBanner(
          icon: Icons.water_drop_outlined,
          title: 'Hydration routine active',
          message:
              '${HydrationWorkflowService.buildProgressLabel(widget.activeHydrationWorkflow!)}. Choose a simple meal that supports the rest of today’s routine.',
          backgroundColor: const Color(0xFF102A43),
          accentColor: const Color(0xFF60A5FA),
          textColor: const Color(0xFFE5E7EB),
        ),
      );
    }

    if (widget.activeWeeklyTrackingWorkflow != null) {
      final weekly = widget.activeWeeklyTrackingWorkflow!;
      banners.add(
        _buildAlertBanner(
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
    }

    if (banners.isEmpty) {
      return _buildEmptyGuidanceCard();
    }

    return Column(
      children: [
        for (int i = 0; i < banners.length; i++) ...[
          banners[i],
          if (i != banners.length - 1) const SizedBox(height: 12),
        ],
      ],
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
              decoration: const InputDecoration(
                hintText: 'Example: rice, spinach, eggs',
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
              decoration: const InputDecoration(),
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: isLoading ? null : _generateAndOpenResult,
              child: Text(isLoading ? 'Generating...' : 'Generate Meal Plan'),
            ),
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

  Widget _buildEmptyGuidanceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF132238),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFF60A5FA).withOpacity(0.22),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF60A5FA).withOpacity(0.14),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.info_outline,
              color: Color(0xFF60A5FA),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'No meal guidance yet',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Log a medicine in the Meds tab first so meal suggestions can match your current care needs.',
                  style: TextStyle(
                    color: Color(0xFFD6DEEA),
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

  @override
  Widget build(BuildContext context) {
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
          _buildRightNowHero(),
          const SizedBox(height: 24),
          _buildStatusCards(),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Meal setup'),
          _buildMealInputCard(),
          const SizedBox(height: 16),
          if (errorMessage != null)
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
        ],
      ),
    );
  }
}
