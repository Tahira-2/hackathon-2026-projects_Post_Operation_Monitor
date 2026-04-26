import 'dart:async';
import 'package:flutter/material.dart';

import '../models/care_state.dart';
import '../models/hydration_workflow.dart';
import '../models/medications.dart';
import '../models/timing_workflow.dart';
import '../models/workflow_suggestion.dart';
import '../services/hydration_workflow_service.dart';
import '../services/timing_workflow_service.dart';
import '../widgets/section_title.dart';

class HomeTab extends StatefulWidget {
  final Medication? latestMedication;
  final WorkflowSuggestion? latestSuggestion;
  final VoidCallback onActivateWorkflow;
  final int activeWorkflowCount;
  final CareState? latestCareState;
  final TimingWorkflow? activeTimingWorkflow;
  final HydrationWorkflow? activeHydrationWorkflow;
  final VoidCallback onStartHydrationRoutine;
  final VoidCallback onLogHydrationGlass;

  const HomeTab({
    super.key,
    required this.latestMedication,
    required this.latestSuggestion,
    required this.onActivateWorkflow,
    required this.activeWorkflowCount,
    required this.latestCareState,
    required this.activeTimingWorkflow,
    required this.activeHydrationWorkflow,
    required this.onStartHydrationRoutine,
    required this.onLogHydrationGlass,
  });

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
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

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Widget _buildMainStatusCard() {
    if (widget.latestMedication == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Nothing logged yet',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Go to the Meds tab and mark a medication as taken to start your care flow.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final bool isTimingActive = widget.activeTimingWorkflow != null &&
        widget.activeTimingWorkflow!.isActive;

    if (widget.activeTimingWorkflow != null && isTimingActive) {
      return Card(
        color: const Color(0xFF3B2A12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xFFFBBF24),
                    size: 26,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Meal window not open yet',
                      style: TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFFBBF24),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                TimingWorkflowService.formatRemaining(
                  widget.activeTimingWorkflow!.remainingTime,
                ),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Opens at ${TimingWorkflowService.formatAllowedTime(widget.activeTimingWorkflow!.eatAfter)}',
                style: const TextStyle(
                  fontSize: 15,
                  color: Color(0xFFE5E7EB),
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'You can prepare food now and eat after the timer ends.',
                style: TextStyle(
                  color: Color(0xFFE5E7EB),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.activeTimingWorkflow != null && !isTimingActive) {
      return Card(
        color: const Color(0xFF123227),
        child: const Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    color: Color(0xFF34D399),
                    size: 26,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'You can eat now',
                      style: TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF34D399),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 14),
              Text(
                'Your waiting period is over.',
                style: TextStyle(
                  fontSize: 16,
                  color: Color(0xFFE5E7EB),
                ),
              ),
              SizedBox(height: 10),
              Text(
                'Go to the Meals tab for a recipe you can eat now.',
                style: TextStyle(
                  color: Color(0xFFE5E7EB),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.activeHydrationWorkflow != null) {
      final hydration = widget.activeHydrationWorkflow!;
      return Card(
        color: const Color(0xFF102A43),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.water_drop_outlined,
                    color: Color(0xFF60A5FA),
                    size: 26,
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Hydration routine active',
                      style: TextStyle(
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF60A5FA),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                HydrationWorkflowService.buildProgressLabel(hydration),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                hydration.isCompleted
                    ? 'You completed today’s hydration goal.'
                    : 'Keep going to stay on track today.',
                style: const TextStyle(
                  color: Color(0xFFE5E7EB),
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
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.latestMedication!.userHeadline,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              widget.latestMedication!.userWhatHappened,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard() {
    if (widget.latestMedication == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'What you can do',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Start by logging a medication in the Meds tab.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final bool isSupportRoutineMedication =
        widget.latestMedication!.workflowType == 'support_routine';

    if (isSupportRoutineMedication && widget.activeHydrationWorkflow == null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'What you can do now',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Hydration support can help you stay consistent today.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton(
                onPressed: widget.onStartHydrationRoutine,
                child: const Text('Start Hydration Routine'),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.activeHydrationWorkflow != null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'What you can do now',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.activeHydrationWorkflow!.isCompleted
                    ? 'You have completed today’s hydration goal.'
                    : 'Log a glass each time you drink water to track your progress.',
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
              if (!widget.activeHydrationWorkflow!.isCompleted) ...[
                const SizedBox(height: 14),
                ElevatedButton(
                  onPressed: widget.onLogHydrationGlass,
                  child: const Text('Log 1 Glass'),
                ),
              ],
            ],
          ),
        ),
      );
    }

    if (widget.activeTimingWorkflow != null &&
        widget.activeTimingWorkflow!.isActive) {
      return Card(
        child: const Padding(
          padding: EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'What you can do now',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Use the Meals tab to generate a recipe now, but save eating for later when the timer ends.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.activeTimingWorkflow != null &&
        !widget.activeTimingWorkflow!.isActive) {
      return Card(
        child: const Padding(
          padding: EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'What you can do now',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Your meal window is open. You can now generate and eat your next meal.',
                style: TextStyle(
                  color: Color(0xFFCBD5E1),
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
              'What you can do now',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              widget.latestMedication!.userNextAction,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportCard() {
    if (widget.latestMedication == null) {
      return const SizedBox.shrink();
    }

    if (widget.activeHydrationWorkflow != null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Today’s support',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                '${widget.activeHydrationWorkflow!.sourceMedicationName} hydration routine is active.',
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.activeTimingWorkflow != null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Today’s support',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                widget.activeTimingWorkflow!.isActive
                    ? 'Meal reminder is active.'
                    : 'Meal reminder completed.',
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.latestSuggestion != null) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Today’s support',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.latestSuggestion!.description,
                style: const TextStyle(
                  color: Color(0xFFCBD5E1),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),
              ElevatedButton(
                onPressed: widget.onActivateWorkflow,
                child: Text(widget.latestSuggestion!.actionLabel),
              ),
            ],
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
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
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Right now'),
          _buildMainStatusCard(),
          const SizedBox(height: 24),
          const SectionTitle(title: 'What you can do'),
          _buildActionCard(),
          const SizedBox(height: 24),
          _buildSupportCard(),
        ],
      ),
    );
  }
}
