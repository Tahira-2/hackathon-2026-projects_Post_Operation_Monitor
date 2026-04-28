# Responsible AI for MediMeal

## Overview

MediMeal is an AI-powered care coordination app that helps users make safer food decisions after taking medication. The app combines rule-based workflow logic with LLM-generated meal suggestions and explanations.

The main responsible AI goal of this project is simple:

**Use AI for helpful language generation, but keep core care logic under application control.**

This matters because medication-related decisions can be sensitive. The app should not rely on a language model alone to decide whether a user should eat now, which ingredients should be removed, or whether a weekly food threshold has been exceeded.

## System Design Principle

MediMeal uses a hybrid architecture:

- **Application logic** determines workflow state and ingredient safety checks
- **The language model** generates structured meal suggestions and explanations using that context

This design intentionally limits what the model is allowed to decide.

### The app determines
- which medication workflow is active
- whether a timing-sensitive wait window is active
- whether hydration support is active
- whether weekly tracking is active
- which ingredients are allowed
- which ingredients are blocked
- whether weekly limits are exceeded
- which ingredients should be removed for the safer version

### The model generates
- meal title
- meal summary
- recipe steps
- ingredient explanations
- user-friendly wording

This separation reduces hallucination risk and improves controllability.

## Data Sources

MediMeal currently uses the following data sources:

### 1. Internal mock medication templates
We created structured medication examples to demonstrate three workflow categories:
- Levothyroxine for timing-sensitive care flow
- Amoxicillin for daily support routine
- Allopurinol for weekly tracking

These are used as demonstration templates for the hackathon prototype.

### 2. Internal rule definitions
The app includes explicit app-side rules for:
- timing-sensitive meal windows
- hydration support logic
- weekly ingredient tracking
- blocked ingredient handling in selected scenarios

These rules are embedded in the prototype and are not dynamically learned from users.

### 3. User-provided ingredients
Users enter ingredients they currently have available. This is the main user input used to generate a meal suggestion.

### 4. Gemini API
The Gemini model is used to generate structured recipe output and explanations, based on app-provided context.

## Model Choice

We used Gemini because it supports:
- strong natural language generation
- structured JSON output
- flexible prompt control
- fast iteration for a hackathon environment

The model is not used as a medical expert system. It is used as a language-generation component within a constrained workflow.

## Why an LLM was Appropriate

An LLM adds value here because the user does not just need a binary yes/no answer. They also need:

- a meal idea using available ingredients
- an understandable explanation
- a helpful tone matched to the care context
- a safer alternative when ingredients are not suitable

This is where language generation is useful.

At the same time, we avoided using the model to make unrestricted care decisions. That helps preserve safety and consistency.

## Safety and Risk Mitigation

### 1. Rule-based safety checks come first
Before the model is called, the app evaluates the user’s context and ingredients. This means:
- blocked ingredients can be removed before recipe generation
- timing-sensitive flows are handled by deterministic app logic
- weekly score logic is handled by deterministic app logic

### 2. Prompt constraints
The prompt explicitly instructs the model to:
- use only allowed ingredients
- not invent new medical rules
- explain removed ingredients clearly
- return valid JSON only
- avoid vague, generic wording

### 3. Structured output parsing
The model is required to return a fixed JSON schema. This reduces ambiguity and makes the output easier to validate in the app.

### 4. Safer regeneration
If certain ingredients would push the user over the weekly threshold, the app can automatically generate a safer version by removing the flagged ingredients.

This reduces the chance that the user is left with a warning but no actionable alternative.

## Bias Considerations

### Food and culture bias
Meal generation systems may unintentionally favor ingredients, cuisines, and cooking assumptions common in mainstream training data. This can lead to:
- culturally narrow recipes
- assumptions about pantry access
- language that does not reflect user food preferences

MediMeal partially addresses this by:
- using the user’s own ingredient list as the starting point
- focusing on practical meal generation from available ingredients
- avoiding fixed meal templates

Still, cultural bias may remain in the phrasing or style of generated meals.

### Health simplification bias
A model may oversimplify a user’s situation if it assumes one condition or one medication context is enough. In reality, many people manage multiple medications and overlapping dietary considerations.

Our current prototype handles individual workflow types well, but combination logic is still limited. This is a known limitation.

### Access bias
The prototype assumes that the user:
- has a smartphone
- can enter ingredients manually
- can interpret app-based reminders and recommendations

That may reduce accessibility for some populations.

## Failure Cases

MediMeal can fail in several ways.

### 1. Incomplete medication logic
The prototype supports selected medication examples and workflow types. It is not a complete medication database and should not be interpreted as one.

### 2. Multi-medication conflicts
The current version does not yet fully resolve all combined medication-food interactions across multiple active conditions. This is an important future improvement area.

### 3. Model output variability
Even with structured prompting, an LLM may occasionally:
- return awkward wording
- produce explanations that feel too generic
- under-emphasize a concern
- generate malformed or inconsistent output

We reduced this risk with prompt constraints and parsing safeguards, but it cannot be removed entirely.

### 4. Notification reliability
Notification behavior can vary across mobile devices and operating system settings, especially with battery optimization or permission settings.

### 5. User misunderstanding
Users might over-trust the app or interpret it as a substitute for clinician advice. That is not the intended use.

## Intended Use

MediMeal is intended as a supportive coordination tool for:
- meal planning after medication intake
- routine support reminders
- ingredient-level caution and explanation
- practical next-step guidance

It is **not** intended to:
- diagnose conditions
- replace a doctor, pharmacist, or dietitian
- give emergency medical advice
- serve as a complete medication safety system

## User Transparency

The app should make clear that:
- recommendations are generated based on current app rules and user-provided ingredients
- the AI is generating meal suggestions and explanations, not acting as a clinician
- important safety decisions are constrained by app logic
- users should consult healthcare professionals for medical concerns or unclear instructions

## Human Oversight

This prototype includes developer-defined workflow rules and explicit UI warnings. For a production-ready version, stronger human oversight would be needed, such as:
- clinical review of rule sets
- pharmacist or dietitian validation
- audited medication-condition mappings
- escalation paths for uncertain recommendations

## Privacy Considerations

The prototype currently uses user-entered ingredients, medication selections, and workflow state to generate suggestions.

A production version should clearly define:
- what data is stored
- whether data is sent to external AI providers
- retention policies
- consent and disclosure
- security controls for personal health-related data

## What We Did Deliberately

We made several deliberate design choices to improve responsible use:

- kept core workflow decisions deterministic
- limited the model’s role to controlled generation tasks
- required structured output
- documented failure modes
- exposed warnings in the UI
- provided safer regeneration instead of only rejecting user input

## Future Responsible AI Improvements

If developed further, MediMeal should include:

- stronger multi-medication rule handling
- clinically reviewed condition-specific food rules
- clearer confidence or uncertainty signaling
- better user education around limitations
- accessibility improvements
- logging and auditability for critical workflow decisions
- expanded testing for culturally diverse meal generation

## Conclusion

MediMeal shows one responsible way to use AI in care coordination:

- let the application handle critical workflow logic
- let the model handle explanation and personalization
- keep limitations visible
- give users actionable alternatives instead of vague warnings

This makes the system more transparent, more controllable, and more appropriate for a healthcare-adjacent use case.