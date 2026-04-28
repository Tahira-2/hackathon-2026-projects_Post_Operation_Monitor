# MediMeal

MediMeal is an AI-powered care coordination app that helps people make safer meal decisions after taking medication.

Instead of giving generic food advice, MediMeal responds to what the user just did. If a person logs a medication, the app adapts the next step based on the type of care need. It can guide users through timing-sensitive medication flows, daily support routines, and weekly tracking situations. The result is a more practical, personalized, and action-oriented experience than a standard reminder app.

## Team Members

- Sandesh Gyawali - @sandeshgyw
- Nischal Bhattarai - @nischal1208
- Samikshya Gyanwali - @jeevagyawali

## Problem Statement

Many people know when to take a medication, but not what to do next.

Medication instructions are often fragmented, easy to forget, or too generic to use in real life. A person may remember to take a tablet, but then still be unsure about questions like:

- Can I eat now or should I wait?
- What can I safely cook with the ingredients I already have?
- Should I avoid certain foods right now?
- Do I need extra hydration or other support today?
- Am I still within my weekly dietary limit for this condition?

Most apps stop at reminders. They help users remember the medicine, but do not guide them through the decisions that come after. This gap can lead to confusion, poor adherence, unsafe meal choices, and low confidence in self-management.

## Our Solution

MediMeal turns medication events into actionable care workflows.

When a user logs a medication as taken, the app checks what kind of support that medication needs and guides the user through the next decision. Instead of giving one generic answer, the app supports three different workflow types:

### 1. Timing-based workflow
For medications like **Levothyroxine**, the user may need to wait before eating.

MediMeal:
- starts a timing-aware care flow
- clearly tells the user to wait before eating
- shows when the meal window opens
- sends a reminder when the waiting period is over
- generates meal suggestions that are framed as “prepare now, eat later” during the waiting period

### 2. Daily support routine
For medications like **Amoxicillin**, the user may need supportive daily routines such as hydration.

MediMeal:
- offers a hydration routine
- tracks progress across the day
- helps the user stay consistent with supportive care actions
- generates meals that fit the tone and needs of that daily routine

### 3. Weekly tracking workflow
For medications like **Allopurinol**, the user may need longer-term food awareness rather than a one-time warning.

MediMeal:
- starts weekly food-awareness tracking
- keeps a running score for ingredients that matter to that condition
- warns the user when a meal would push them over the weekly limit
- identifies which ingredients are causing the issue
- lets the user generate a safer version by automatically removing the flagged ingredients

## Why MediMeal is Different

MediMeal is not just a reminder app and not just a recipe generator.

It combines:
- medication logging
- condition-aware meal screening
- next-step guidance
- AI-generated meal suggestions
- workflow-based care support

This makes the app much more context-aware and useful in real daily life.

The project is designed around a simple idea:

**After taking medicine, people do not just need reminders. They need guided decisions.**

## Key Features

- Add medications with reminder times
- Mark medications as taken
- Trigger medication-specific care workflows
- Show active care context on the Home screen
- Generate AI meal suggestions based on ingredients and care status
- Detect blocked or risky ingredients
- Explain why ingredients fit or were removed
- Offer safer regenerated meals when needed
- Track hydration progress
- Track weekly food-awareness scores
- Send meal-window and medication reminders

## User Flow

1. User adds a medication and sets a reminder time  
2. User marks the medication as taken  
3. MediMeal activates the relevant care workflow  
4. User sees what matters right now on the Home screen  
5. User goes to Meals and enters ingredients  
6. AI generates a meal that fits the user’s current medication context  
7. User sees warnings, safer alternatives, and explanation of ingredient choices  
8. User logs the meal if weekly tracking applies  

## Tech Stack

### Frontend
- Flutter
- Dart

### AI
- Gemini API for structured meal generation and explanation

### Local logic and workflow engine
- Custom workflow engine for:
  - timing-sensitive medication logic
  - daily support routine logic
  - weekly tracking logic
  - ingredient evaluation
  - safer regeneration flow

### Notifications
- flutter_local_notifications

## Architecture Overview

MediMeal uses a hybrid approach:

- **Deterministic workflow logic** handles safety-sensitive rules and app state
- **LLM output** handles meal generation and natural-language explanation

This separation is important.

The app itself decides:
- which workflow is active
- whether the user should wait
- which ingredients are blocked
- whether weekly limits are exceeded
- which ingredients should be removed for a safer version

The model then receives this structured context and generates:
- a meal suggestion
- a short summary
- steps
- ingredient explanations

This design keeps critical decisions out of the model and makes the app more reliable.

## Demo

The demo video and presentation slides are included in the `demo/` folder of this repository.

## Setup Instructions

### Prerequisites
- Flutter installed
- FVM optional if you are using a fixed Flutter version
- Android device or emulator
- Gemini API key

### Installation

```bash
git clone [your-repo-link]
cd [your-project-folder]
flutter pub get
