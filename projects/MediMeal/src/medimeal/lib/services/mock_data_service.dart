import '../models/medicine_template.dart';

class MockDataService {
  static List<MedicineTemplate> getMedicineTemplates() {
    return const [
      MedicineTemplate(
        id: '1',
        name: 'Levothyroxine',
        dosage: '50 mcg',
        workflowType: 'timing_sensitive',
        waitBeforeMealSeconds: 1800,
        autoStartWorkflow: true,
        userHeadline: 'Your next meal timing matters',
        userWhatHappened: 'You logged your morning medication.',
        userWhatMattersNow:
            'Wait before eating so your next meal fits the current timing window.',
        userNextAction:
            'You can prepare a meal now, but wait until the reminder before eating.',
      ),
      MedicineTemplate(
        id: '2',
        name: 'Amoxicillin',
        dosage: '500 mg',
        workflowType: 'support_routine',
        waitBeforeMealSeconds: null,
        autoStartWorkflow: false,
        userHeadline: 'Stay on track today',
        userWhatHappened: 'You logged your medication for today.',
        userWhatMattersNow:
            'A support routine can help you stay consistent for the rest of the day.',
        userNextAction:
            'Start a support routine and choose a simple meal that fits today.',
      ),
      MedicineTemplate(
        id: '3',
        name: 'Allopurinol',
        dosage: '100 mg',
        workflowType: 'weekly_tracking',
        waitBeforeMealSeconds: null,
        autoStartWorkflow: false,
        userHeadline: 'This week’s choices affect future suggestions',
        userWhatHappened:
            'You logged your medication and weekly tracking is active.',
        userWhatMattersNow:
            'This week’s previous choices affect what the app should suggest next.',
        userNextAction:
            'Choose meals that stay within your remaining flexibility for the week.',
      ),
    ];
  }
}
