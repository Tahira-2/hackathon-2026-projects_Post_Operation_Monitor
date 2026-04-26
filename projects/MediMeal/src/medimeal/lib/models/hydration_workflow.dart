class HydrationWorkflow {
  final String sourceMedicationName;
  final int goalGlasses;
  final int completedGlasses;
  final bool isActive;

  const HydrationWorkflow({
    required this.sourceMedicationName,
    required this.goalGlasses,
    required this.completedGlasses,
    required this.isActive,
  });

  HydrationWorkflow copyWith({
    String? sourceMedicationName,
    int? goalGlasses,
    int? completedGlasses,
    bool? isActive,
  }) {
    return HydrationWorkflow(
      sourceMedicationName: sourceMedicationName ?? this.sourceMedicationName,
      goalGlasses: goalGlasses ?? this.goalGlasses,
      completedGlasses: completedGlasses ?? this.completedGlasses,
      isActive: isActive ?? this.isActive,
    );
  }

  bool get isCompleted => completedGlasses >= goalGlasses;
}
