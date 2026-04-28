enum EventType {
  medicationTaken,
  medicationMissed,
  mealLogged,
}

class LoggedEvent {
  final String id;
  final EventType type;
  final String medicationId;
  final DateTime timestamp;

  LoggedEvent({
    required this.id,
    required this.type,
    required this.medicationId,
    required this.timestamp,
  });
}
