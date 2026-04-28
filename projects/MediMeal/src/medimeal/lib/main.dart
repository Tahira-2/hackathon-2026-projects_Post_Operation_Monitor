import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:medimeal/services/notification_service.dart';
import 'package:medimeal/theme/app_theme.dart';
import 'screens/main_navigation_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await NotificationService.initialize();

  runApp(const MediMealApp());
}

class MediMealApp extends StatelessWidget {
  const MediMealApp({super.key});

  @override
  Widget build(BuildContext context) {
    const backgroundColor = Color(0xFF0F172A);
    const cardColor = Color(0xFF1E293B);
    const accentColor = Color(0xFF14B8A6);
    const textColor = Color(0xFFF8FAFC);
    const subTextColor = Color(0xFFCBD5E1);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'MediMeal',
      theme: AppTheme.darkTheme(),
      home: const MainNavigationScreen(),
    );
  }
}
