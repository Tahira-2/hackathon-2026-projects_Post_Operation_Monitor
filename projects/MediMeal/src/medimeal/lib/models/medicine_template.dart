class MedicineTemplate {
  final String id;
  final String name;
  final String dosage;
  final String workflowType;

  final int? waitBeforeMealSeconds;
  final bool autoStartWorkflow;

  final String userHeadline;
  final String userWhatHappened;
  final String userWhatMattersNow;
  final String userNextAction;

  const MedicineTemplate({
    required this.id,
    required this.name,
    required this.dosage,
    required this.workflowType,
    this.waitBeforeMealSeconds,
    required this.autoStartWorkflow,
    required this.userHeadline,
    required this.userWhatHappened,
    required this.userWhatMattersNow,
    required this.userNextAction,
  });
}
