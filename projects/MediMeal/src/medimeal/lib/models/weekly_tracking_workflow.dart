class WeeklyTrackingWorkflow {
  final String sourceMedicationName;
  final int weeklyLimit;
  final int usedThisWeek;
  final bool isActive;

  const WeeklyTrackingWorkflow({
    required this.sourceMedicationName,
    required this.weeklyLimit,
    required this.usedThisWeek,
    required this.isActive,
  });

  WeeklyTrackingWorkflow copyWith({
    String? sourceMedicationName,
    int? weeklyLimit,
    int? usedThisWeek,
    bool? isActive,
  }) {
    return WeeklyTrackingWorkflow(
      sourceMedicationName: sourceMedicationName ?? this.sourceMedicationName,
      weeklyLimit: weeklyLimit ?? this.weeklyLimit,
      usedThisWeek: usedThisWeek ?? this.usedThisWeek,
      isActive: isActive ?? this.isActive,
    );
  }

  int get remaining => weeklyLimit - usedThisWeek;
  bool get isNearLimit => remaining <= 5 && remaining > 0;
  bool get isExceeded => usedThisWeek >= weeklyLimit;
}
