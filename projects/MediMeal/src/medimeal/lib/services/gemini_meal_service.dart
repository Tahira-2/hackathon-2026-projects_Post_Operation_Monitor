import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../models/care_state.dart';
import '../models/ingredient_evaluation_result.dart';
import '../models/meal_plan.dart';
import '../models/medications.dart';

class GeminiMealService {
  static final String _apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';

  // Keep only models that you can actually use.
  static const List<String> _modelFallbackOrder = [
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemma-3-27b-it',
    'gemma-4-26b-a4b-it',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
  ];

  // Total attempts across all models.
  static const int _maxTotalAttempts = 10;

  static Future<MealPlan> generateMealPlan({
    required String mealType,
    required String timingNote,
    required IngredientEvaluationResult evaluation,
    CareState? careState,
    Medication? latestMedication,
    String? supportNote,
    String? weeklyNote,
  }) async {
    if (_apiKey.isEmpty) {
      throw Exception('GEMINI_API_KEY is missing in .env');
    }

    final careSummary = careState?.summary ?? 'No active care state';
    final careCaution = careState?.caution ?? 'No active caution';
    final medicationName =
        latestMedication?.name ?? 'the user’s recent medication';
    final medicationPurpose =
        latestMedication?.instructions ?? 'part of the user’s care routine';
    final routineSupportNote = supportNote ?? '';
    final routineWeeklyNote = weeklyNote ?? '';

    final originalIngredients = evaluation.originalIngredients.join(', ');
    final allowedIngredients = evaluation.allowedIngredients.join(', ');
    final blockedIngredients = evaluation.blockedIngredients.join(', ');

    final blockedReasonsText = evaluation.blockedReasons.entries.isEmpty
        ? 'None'
        : evaluation.blockedReasons.entries
            .map((e) => '- ${e.key}: ${e.value}')
            .join('\n');

    final prompt = '''
You are generating a meal response for a healthcare support app.

Important:
- The app already determined the care workflow.
- Do not invent medical rules beyond what is provided here.
- Use only the allowed ingredients for the recipe.
- If some ingredients were blocked, explain that clearly in simple language.
- If the allowed ingredients are limited, still try to suggest a simple recipe using the allowed ingredients and common safe pantry basics like salt, pepper, oil, or water.
- Do not return "no recipe" unless it is truly impossible to make even a simple meal.

USER CONTEXT
- Logged medication: $medicationName
- Medication context: $medicationPurpose
- Care summary: $careSummary
- Care caution: $careCaution
- Timing note: $timingNote
- Support routine note: $routineSupportNote
- Weekly tracking note: $routineWeeklyNote
- Meal type requested: $mealType

INGREDIENT REVIEW
- Original ingredients from user: $originalIngredients
- Allowed ingredients: $allowedIngredients
- Blocked ingredients: $blockedIngredients
- Blocked reasons:
$blockedReasonsText

YOUR JOB
1. Generate a recipe using only the allowed ingredients.
2. Do not use blocked ingredients in the recipe.
3. In "whyIngredientsFit", explain in simple user-friendly language why each kept ingredient was a good fit.
4. In "whyIngredientsWereBlocked", explain in simple user-friendly language why each blocked ingredient was excluded.
5. If the timing window is still active, make it clear in "timingMessage" that the meal is for preparation now and eating later.
6. If a support routine is active, make the meal feel simple, supportive, and easy to follow for today.
7. If weekly tracking is active, make the meal feel careful and compatible with the remaining weekly allowance.
8. Do not use vague phrases like "adheres to workflow constraints" or "balanced meal" unless you also explain specifically why.
9. Keep the wording human and direct.

IMPORTANT JSON FORMATTING RULES
- Return valid JSON only.
- Do not include markdown code fences.
- Every array field must contain plain strings only.
- Do not return objects inside arrays.
- Do not return nested JSON inside any field.
- "ingredientsUsed" must be an array of strings.
- "blockedIngredients" must be an array of strings.
- "steps" must be an array of strings.
- "whyIngredientsFit" must be an array of plain strings only.
- "whyIngredientsWereBlocked" must be an array of plain strings only.
- "warning" must be a plain string.
- "timingMessage" must be a plain string.

RETURN VALID JSON ONLY
{
  "canGenerateRecipe": true,
  "title": "",
  "summary": "",
  "ingredientsUsed": [],
  "blockedIngredients": [],
  "warning": "",
  "steps": [],
  "whyIngredientsFit": [],
  "whyIngredientsWereBlocked": [],
  "timingMessage": ""
}
''';

    Exception? lastError;

    for (int attempt = 0; attempt < _maxTotalAttempts; attempt++) {
      final modelName =
          _modelFallbackOrder[attempt % _modelFallbackOrder.length];

      try {
        final mealPlan = await _callModel(
          modelName: modelName,
          prompt: prompt,
        );
        return mealPlan;
      } catch (e) {
        final isRetryable = _isRetryableError(e);

        if (!isRetryable) {
          rethrow;
        }

        lastError = e is Exception ? e : Exception(e.toString());

        // progressive backoff: 500ms, 1000ms, 1500ms, ...
        final waitMs = 500 * (attempt + 1);
        await Future.delayed(Duration(milliseconds: waitMs));
      }
    }

    throw lastError ??
        Exception(
            'All Gemini fallback attempts failed to generate a meal plan.');
  }

  static Future<MealPlan> _callModel({
    required String modelName,
    required String prompt,
  }) async {
    final response = await http.post(
      Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/$modelName:generateContent',
      ),
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': _apiKey,
      },
      body: jsonEncode({
        'contents': [
          {
            'parts': [
              {'text': prompt}
            ]
          }
        ]
      }),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'Gemini call failed for model $modelName with status ${response.statusCode}: ${response.body}',
      );
    }

    final decoded = jsonDecode(response.body);
    final content =
        decoded['candidates']?[0]?['content']?['parts']?[0]?['text'];

    if (content == null || content.toString().trim().isEmpty) {
      throw Exception(
          'Gemini returned an empty response for model $modelName.');
    }

    final cleaned = _stripCodeFences(content.toString().trim());
    final Map<String, dynamic> mealJson = jsonDecode(cleaned);

    return MealPlan.fromJson(mealJson);
  }

  static bool _isRetryableError(Object error) {
    final text = error.toString().toLowerCase();

    return text.contains('503') ||
        text.contains('502') ||
        text.contains('504') ||
        text.contains('500') ||
        text.contains('429') ||
        text.contains('unavailable') ||
        text.contains('overloaded') ||
        text.contains('deadline exceeded') ||
        text.contains('temporarily');
  }

  static String _stripCodeFences(String text) {
    var cleaned = text.trim();

    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replaceFirst('```json', '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replaceFirst('```', '').trim();
    }

    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3).trim();
    }

    return cleaned;
  }
}
