import 'package:medimeal/models/medications.dart';

class MockDataService {
  static List<Medication> getMedications() {
    return [
      Medication(
        id: '1',
        name: 'Morning Medication A',
        dosage: '1 tablet',
        time: '6:00 AM',
        instructions: 'Take as directed',
        workflowType: 'timing_sensitive',
      ),
      Medication(
        id: '2',
        name: 'Medication B',
        dosage: '1 tablet',
        time: '9:00 AM',
        instructions: 'Take as directed',
        workflowType: 'hydration_support',
      ),
      Medication(
        id: '3',
        name: 'Medication C',
        dosage: '1 tablet',
        time: '1:00 PM',
        instructions: 'Take as directed',
        workflowType: 'weekly_limit_tracking',
      ),
    ];
  }
}
