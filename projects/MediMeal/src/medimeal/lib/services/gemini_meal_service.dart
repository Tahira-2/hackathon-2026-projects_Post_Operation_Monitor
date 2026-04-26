import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../models/care_state.dart';
import '../models/ingredient_evaluation_result.dart';
import '../models/meal_plan.dart';
import '../models/medications.dart';

class GeminiMealService {
  static final String _apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';

  static Future<MealPlan> generateMealPlan({
    required String mealType,
    required String timingNote,
    required IngredientEvaluationResult evaluation,
    CareState? careState,
    Medication? latestMedication,
    String? supportNote,
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
7. Do not use vague phrases like "adheres to workflow constraints" or "balanced meal" unless you also explain specifically why.
8. Keep the wording human and direct.

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

    final response = await http.post(
      Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
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
      throw Exception('Failed to generate meal plan: ${response.body}');
    }

    final decoded = jsonDecode(response.body);
    final content =
        decoded['candidates']?[0]?['content']?['parts']?[0]?['text'];

    if (content == null || content.toString().trim().isEmpty) {
      throw Exception('Gemini returned an empty response.');
    }

    final cleaned = _stripCodeFences(content.toString().trim());
    final Map<String, dynamic> mealJson = jsonDecode(cleaned);

    return MealPlan.fromJson(mealJson);
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
