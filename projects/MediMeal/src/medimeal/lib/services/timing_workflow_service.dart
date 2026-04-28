import 'package:medimeal/models/medications.dart';

import '../config/app_config.dart';
import '../models/timing_workflow.dart';

class TimingWorkflowService {
  static TimingWorkflow createFromMedication(Medication medication) {
    final now = DateTime.now();

    final int waitSeconds = AppConfig.isDemoMode
        ? AppConfig.demoTimingWaitSeconds
        : (medication.waitBeforeMealSeconds ?? 0);

    final eatAfter = now.add(Duration(seconds: waitSeconds));

    return TimingWorkflow(
      medicationName: medication.name,
      loggedAt: now,
      eatAfter: eatAfter,
      reminderScheduled: true,
    );
  }

  static String formatRemaining(Duration duration) {
    if (duration.inSeconds <= 0) {
      return 'You can eat now.';
    }

    if (duration.inMinutes >= 1) {
      final minutes = duration.inMinutes;
      return 'Wait $minutes more minute${minutes == 1 ? '' : 's'} before eating.';
    }

    final seconds = duration.inSeconds;
    return 'Wait $seconds more second${seconds == 1 ? '' : 's'} before eating.';
  }

  static String formatAllowedTime(DateTime dateTime) {
    final hour = dateTime.hour > 12
        ? dateTime.hour - 12
        : (dateTime.hour == 0 ? 12 : dateTime.hour);
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final period = dateTime.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }
}
