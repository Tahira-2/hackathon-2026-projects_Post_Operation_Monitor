import 'package:flutter/material.dart';

class AppSnackbar {
  static void show(
    BuildContext context, {
    required String message,
    IconData icon = Icons.check_circle_outline,
    Color accent = const Color(0xFF60A5FA),
    Color background = const Color(0xFF182338),
    Duration duration = const Duration(seconds: 2),
  }) {
    final messenger = ScaffoldMessenger.of(context);

    messenger.hideCurrentSnackBar();

    messenger.showSnackBar(
      SnackBar(
        duration: duration,
        behavior: SnackBarBehavior.floating,
        elevation: 0,
        backgroundColor: Colors.transparent,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        padding: EdgeInsets.zero,
        content: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: accent.withOpacity(0.25)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.22),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 36,
                width: 36,
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: accent, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14.5,
                    fontWeight: FontWeight.w600,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static void success(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.check_circle_outline,
      accent: const Color(0xFF34D399),
      background: const Color(0xFF10261F),
    );
  }

  static void info(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.info_outline,
      accent: const Color(0xFF60A5FA),
      background: const Color(0xFF182338),
    );
  }

  static void warning(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.warning_amber_rounded,
      accent: const Color(0xFFFBBF24),
      background: const Color(0xFF33240E),
    );
  }

  static void danger(BuildContext context, String message) {
    show(
      context,
      message: message,
      icon: Icons.error_outline,
      accent: const Color(0xFFF87171),
      background: const Color(0xFF341617),
    );
  }
}
