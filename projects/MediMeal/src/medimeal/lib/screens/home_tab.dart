import 'dart:async';
import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../models/hydration_workflow.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';
import '../models/weekly_tracking_workflow.dart';
import '../models/workflow_suggestion.dart';
import '../services/hydration_workflow_service.dart';
import '../services/timing_workflow_service.dart';
import '../services/weekly_tracking_workflow_service.dart';
import '../widgets/section_title.dart';

class HomeTab extends StatefulWidget {
  final Medication? latestMedication;
  final WorkflowSuggestion? latestSuggestion;
  final VoidCallback onActivateWorkflow;
  final int activeWorkflowCount;
  final CareState? latestCareState;
  final TimingWorkflow? activeTimingWorkflow;
  final HydrationWorkflow? activeHydrationWorkflow;
  final WeeklyTrackingWorkflow? activeWeeklyTrackingWorkflow;
  final bool shouldOfferHydrationRoutine;
  final bool shouldOfferWeeklyTracking;
  final VoidCallback onStartHydrationRoutine;
  final VoidCallback onLogHydrationGlass;
  final VoidCallback onStartWeeklyTracking;

  const HomeTab({
    super.key,
    required this.latestMedication,
    required this.latestSuggestion,
    required this.onActivateWorkflow,
    required this.activeWorkflowCount,
    required this.latestCareState,
    required this.activeTimingWorkflow,
    required this.activeHydrationWorkflow,
    required this.activeWeeklyTrackingWorkflow,
    required this.shouldOfferHydrationRoutine,
    required this.shouldOfferWeeklyTracking,
    required this.onStartHydrationRoutine,
    required this.onLogHydrationGlass,
    required this.onStartWeeklyTracking,
  });

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  Timer? _timer;
  late final PageController _secondaryStatusController;
  int _secondaryStatusIndex = 0;

  @override
  void initState() {
    super.initState();
    _secondaryStatusController = PageController(viewportFraction: 0.94);
    _startTimerIfNeeded();
  }

  @override
  void didUpdateWidget(covariant HomeTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    _startTimerIfNeeded();
  }

  void _startTimerIfNeeded() {
    _timer?.cancel();

    final workflow = widget.activeTimingWorkflow;
    if (workflow != null && workflow.isActive) {
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted) return;

        if (widget.activeTimingWorkflow == null ||
            !widget.activeTimingWorkflow!.isActive) {
          _timer?.cancel();
        } else {
          setState(() {});
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _secondaryStatusController.dispose();
    super.dispose();
  }

  Widget _heroCard({
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
          colors: [bg, bg.withOpacity(0.92)],
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
              fontSize: 30,
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

  Widget _buildPrimaryStatusCard() {
    final timing = widget.activeTimingWorkflow;
    final hydration = widget.activeHydrationWorkflow;
    final weekly = widget.activeWeeklyTrackingWorkflow;

    if (widget.latestMedication == null &&
        timing == null &&
        hydration == null &&
        weekly == null) {
      return _heroCard(
        icon: Icons.health_and_safety_outlined,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF132238),
        title: 'Nothing logged yet',
        value: 'Ready to start',
        subtitle:
            'Go to the Meds tab and mark a medication as taken to begin your care flow.',
      );
    }

    if (timing != null && timing.isActive) {
      return _heroCard(
        icon: Icons.schedule,
        accent: const Color(0xFFFBBF24),
        bg: const Color(0xFF33240E),
        title: 'Wait before eating',
        value: TimingWorkflowService.formatRemaining(timing.remainingTime),
        subtitle:
            'Meal window opens at ${TimingWorkflowService.formatAllowedTime(timing.eatAfter)}. You can prepare food now and eat after the timer ends.',
      );
    }

    if (weekly != null && weekly.isExceeded) {
      return _heroCard(
        icon: Icons.error_outline,
        accent: const Color(0xFFF87171),
        bg: const Color(0xFF341617),
        title: 'Weekly limit reached',
        value: WeeklyTrackingWorkflowService.buildProgressLabel(weekly),
        subtitle:
            'This week’s next meals should avoid tracked ingredients until your weekly score resets.',
      );
    }

    if (weekly != null && weekly.isNearLimit) {
      return _heroCard(
        icon: Icons.warning_amber_rounded,
        accent: const Color(0xFFFBBF24),
        bg: const Color(0xFF33240E),
        title: 'Weekly limit almost reached',
        value: WeeklyTrackingWorkflowService.buildProgressLabel(weekly),
        subtitle:
            '${WeeklyTrackingWorkflowService.buildRemainingLabel(weekly)}. Choose lighter meals so you stay within this week’s allowance.',
      );
    }

    if (hydration != null) {
      return _heroCard(
        icon: Icons.water_drop_outlined,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF12283D),
        title: 'Hydration routine active',
        value: HydrationWorkflowService.buildProgressLabel(hydration),
        subtitle: hydration.isCompleted
            ? 'You completed today’s hydration goal.'
            : 'Keep going to stay on track with today’s routine.',
      );
    }

    if (timing != null && !timing.isActive) {
      return _heroCard(
        icon: Icons.check_circle_outline,
        accent: const Color(0xFF34D399),
        bg: const Color(0xFF132A23),
        title: 'Meal window open',
        value: 'You can eat now',
        subtitle:
            'Your waiting period is over. You can now eat meals that fit your plan.',
      );
    }

    if (widget.shouldOfferHydrationRoutine &&
        widget.shouldOfferWeeklyTracking) {
      return _heroCard(
        icon: Icons.auto_awesome_outlined,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF132238),
        title: 'Support options ready',
        value: '2 next steps available',
        subtitle:
            'Hydration support and weekly tracking are both ready below. Choose the one you want to start first.',
      );
    }

    if (widget.shouldOfferHydrationRoutine) {
      return _heroCard(
        icon: Icons.water_drop_outlined,
        accent: const Color(0xFF60A5FA),
        bg: const Color(0xFF12283D),
        title: 'Stay on track today',
        value: 'Hydration support available',
        subtitle:
            'A hydration routine is ready to help you stay consistent for the rest of the day.',
      );
    }

    if (widget.shouldOfferWeeklyTracking) {
      return _heroCard(
        icon: Icons.insights_outlined,
        accent: const Color(0xFFC084FC),
        bg: const Color(0xFF241241),
        title: 'Track this week’s choices',
        value: 'Weekly tracking available',
        subtitle:
            'Weekly food-awareness tracking is ready and can guide your next meal choices.',
      );
    }

    return _heroCard(
      icon: Icons.medication_outlined,
      accent: const Color(0xFF60A5FA),
      bg: const Color(0xFF132238),
      title: widget.latestMedication?.userHeadline ?? 'Care flow active',
      value: widget.latestMedication?.name ?? 'Medication logged',
      subtitle: widget.latestMedication?.userWhatHappened ??
          'Your care flow is active.',
    );
  }

  Widget _chip({
    required IconData icon,
    required String label,
    required Color bg,
    required Color fg,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: fg.withOpacity(0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: fg),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveSupportChips() {
    final timing = widget.activeTimingWorkflow;
    final hydration = widget.activeHydrationWorkflow;
    final weekly = widget.activeWeeklyTrackingWorkflow;

    final chips = <Widget>[];

    if (timing != null) {
      chips.add(
        _chip(
          icon: timing.isActive ? Icons.schedule : Icons.check_circle_outline,
          label: timing.isActive
              ? TimingWorkflowService.formatRemaining(timing.remainingTime)
              : 'Meal ready',
          bg: timing.isActive
              ? const Color(0xFF33240E)
              : const Color(0xFF132A23),
          fg: timing.isActive
              ? const Color(0xFFFBBF24)
              : const Color(0xFF34D399),
        ),
      );
    }

    if (hydration != null) {
      chips.add(
        _chip(
          icon: Icons.water_drop_outlined,
          label: HydrationWorkflowService.buildProgressLabel(hydration),
          bg: const Color(0xFF12283D),
          fg: const Color(0xFF60A5FA),
        ),
      );
    }

    if (weekly != null) {
      chips.add(
        _chip(
          icon: weekly.isExceeded
              ? Icons.error_outline
              : weekly.isNearLimit
                  ? Icons.warning_amber_rounded
                  : Icons.insights_outlined,
          label: '${weekly.usedThisWeek}/${weekly.weeklyLimit}',
          bg: weekly.isExceeded
              ? const Color(0xFF341617)
              : weekly.isNearLimit
                  ? const Color(0xFF33240E)
                  : const Color(0xFF241241),
          fg: weekly.isExceeded
              ? const Color(0xFFF87171)
              : weekly.isNearLimit
                  ? const Color(0xFFFBBF24)
                  : const Color(0xFFC084FC),
        ),
      );
    }

    if (chips.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle(title: 'Active support'),
        const SizedBox(height: 10),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: chips,
        ),
      ],
    );
  }

  List<Widget> _buildSecondaryStatusCards() {
    final cards = <Widget>[];
    final timing = widget.activeTimingWorkflow;
    final hydration = widget.activeHydrationWorkflow;
    final weekly = widget.activeWeeklyTrackingWorkflow;

    final bool primaryIsTiming = timing != null && timing.isActive;
    final bool primaryIsWeeklyExceeded = weekly != null && weekly.isExceeded;
    final bool primaryIsWeeklyNear =
        weekly != null && weekly.isNearLimit && !primaryIsWeeklyExceeded;
    final bool primaryIsHydration = !primaryIsTiming &&
        !primaryIsWeeklyExceeded &&
        !primaryIsWeeklyNear &&
        hydration != null;
    final bool primaryIsMealReady = !primaryIsTiming &&
        !primaryIsWeeklyExceeded &&
        !primaryIsWeeklyNear &&
        hydration == null &&
        timing != null &&
        !timing.isActive;

    if (timing != null && !primaryIsTiming && !primaryIsMealReady) {
      cards.add(
        _miniStatusCard(
          icon: timing.isActive ? Icons.schedule : Icons.check_circle_outline,
          accent: timing.isActive
              ? const Color(0xFFFBBF24)
              : const Color(0xFF34D399),
          bg: timing.isActive
              ? const Color(0xFF33240E)
              : const Color(0xFF132A23),
          title: timing.isActive ? 'Timing active' : 'Meal ready',
          value: timing.isActive
              ? TimingWorkflowService.formatRemaining(timing.remainingTime)
              : 'Window open',
          subtitle: timing.isActive
              ? 'Meal opens at ${TimingWorkflowService.formatAllowedTime(timing.eatAfter)}'
              : 'You can eat now.',
        ),
      );
    }

    if (hydration != null && !primaryIsHydration) {
      cards.add(
        _miniStatusCard(
          icon: Icons.water_drop_outlined,
          accent: const Color(0xFF60A5FA),
          bg: const Color(0xFF12283D),
          title: 'Hydration',
          value: HydrationWorkflowService.buildProgressLabel(hydration),
          subtitle: hydration.isCompleted
              ? 'Goal completed for today.'
              : 'Keep tracking today’s glasses.',
        ),
      );
    }

    if (weekly != null && !primaryIsWeeklyExceeded && !primaryIsWeeklyNear) {
      cards.add(
        _miniStatusCard(
          icon: Icons.insights_outlined,
          accent: const Color(0xFFC084FC),
          bg: const Color(0xFF241241),
          title: 'Weekly tracking',
          value: WeeklyTrackingWorkflowService.buildProgressLabel(weekly),
          subtitle: WeeklyTrackingWorkflowService.buildRemainingLabel(weekly),
        ),
      );
    }

    if (timing != null && primaryIsMealReady) {
      if (hydration != null || weekly != null) {
        cards.add(
          _miniStatusCard(
            icon: Icons.check_circle_outline,
            accent: const Color(0xFF34D399),
            bg: const Color(0xFF132A23),
            title: 'Meal ready',
            value: 'Window open',
            subtitle: 'You can eat now.',
          ),
        );
      }
    }

    return cards;
  }

  Widget _miniStatusCard({
    required IconData icon,
    required Color accent,
    required Color bg,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: accent.withOpacity(0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: accent, size: 22),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              color: accent,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: const TextStyle(
              color: Color(0xFFD6DEEA),
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSecondaryStatusesSection() {
    final cards = _buildSecondaryStatusCards();
    if (cards.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionTitle(title: 'Also active'),
        const SizedBox(height: 10),
        SizedBox(
          height: 185,
          child: PageView.builder(
            controller: _secondaryStatusController,
            itemCount: cards.length,
            onPageChanged: (index) {
              setState(() {
                _secondaryStatusIndex = index;
              });
            },
            itemBuilder: (context, index) {
              final isLast = index == cards.length - 1;
              return Padding(
                padding: EdgeInsets.only(right: isLast ? 0 : 12),
                child: cards[index],
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            cards.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              height: 8,
              width: index == _secondaryStatusIndex ? 22 : 8,
              decoration: BoxDecoration(
                color: index == _secondaryStatusIndex
                    ? const Color(0xFF60A5FA)
                    : const Color(0xFF314055),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _supportInfoRow({
    required IconData icon,
    required Color accent,
    required String title,
    required String subtitle,
    String? buttonLabel,
    VoidCallback? onPressed,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF182234),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: accent.withOpacity(0.18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 38,
            width: 38,
            decoration: BoxDecoration(
              color: accent.withOpacity(0.14),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: accent, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Color(0xFFB6C2D1),
                    height: 1.35,
                  ),
                ),
                if (buttonLabel != null && onPressed != null) ...[
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: onPressed,
                    child: Text(buttonLabel),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionsSection() {
    final items = <Widget>[];

    if (widget.shouldOfferHydrationRoutine) {
      items.add(
        _supportInfoRow(
          icon: Icons.water_drop_outlined,
          accent: const Color(0xFF60A5FA),
          title: 'Hydration support available',
          subtitle:
              'Start a hydration routine to break today’s goal into a simple trackable plan.',
          buttonLabel: 'Start hydration routine',
          onPressed: widget.onStartHydrationRoutine,
        ),
      );
    }

    if (widget.shouldOfferWeeklyTracking) {
      items.add(
        _supportInfoRow(
          icon: Icons.insights_outlined,
          accent: const Color(0xFFC084FC),
          title: 'Weekly tracking available',
          subtitle:
              'Start weekly tracking so meal suggestions can adapt to your remaining allowance.',
          buttonLabel: 'Start weekly tracking',
          onPressed: widget.onStartWeeklyTracking,
        ),
      );
    }

    if (widget.activeHydrationWorkflow != null &&
        !widget.activeHydrationWorkflow!.isCompleted) {
      items.add(
        _supportInfoRow(
          icon: Icons.local_drink_outlined,
          accent: const Color(0xFF60A5FA),
          title: 'Hydration progress',
          subtitle:
              'Tap below whenever you finish a glass to keep your routine updated.',
          buttonLabel: 'Log 1 glass',
          onPressed: widget.onLogHydrationGlass,
        ),
      );
    }

    if (widget.activeTimingWorkflow != null &&
        widget.activeTimingWorkflow!.isActive) {
      items.add(
        _supportInfoRow(
          icon: Icons.restaurant_menu,
          accent: const Color(0xFFFBBF24),
          title: 'Meal planning available',
          subtitle:
              'Use the Meals tab to generate a recipe now and eat it once the timer ends.',
        ),
      );
    }

    if (items.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Available actions',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.latestMedication?.userNextAction ??
                    'No actions available right now.',
                style: const TextStyle(
                  color: Color(0xFFB6C2D1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Available actions',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 14),
            ...[
              for (int i = 0; i < items.length; i++) ...[
                items[i],
                if (i != items.length - 1) const SizedBox(height: 12),
              ]
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasSupport = widget.activeTimingWorkflow != null ||
        widget.activeHydrationWorkflow != null ||
        widget.activeWeeklyTrackingWorkflow != null;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'MediMeal',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Adaptive care workflows for your day',
            style: TextStyle(
              color: Color(0xFF8FA1B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Right now'),
          _buildPrimaryStatusCard(),
          if (hasSupport) ...[
            const SizedBox(height: 20),
            _buildActiveSupportChips(),
            const SizedBox(height: 20),
            _buildSecondaryStatusesSection(),
          ],
          const SizedBox(height: 24),
          _buildActionsSection(),
        ],
      ),
    );
  }
}
