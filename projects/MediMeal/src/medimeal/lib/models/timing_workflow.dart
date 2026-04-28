class TimingWorkflow {
  final String medicationName;
  final DateTime loggedAt;
  final DateTime eatAfter;
  final bool reminderScheduled;

  TimingWorkflow({
    required this.medicationName,
    required this.loggedAt,
    required this.eatAfter,
    required this.reminderScheduled,
  });

  bool get isActive => DateTime.now().isBefore(eatAfter);

  Duration get remainingTime => eatAfter.difference(DateTime.now());
}
