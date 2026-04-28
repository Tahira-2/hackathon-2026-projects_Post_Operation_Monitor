class CasualEngine:
    """
    Personalized health recommendation engine.

    Produces disease-aware risk adjustments and structured recommendations
    including urgency guidance, lifestyle tips, risk-awareness messages,
    and disease-specific advice.  All output is informational and clearly
    marked as non-diagnostic.
    """

    # ------------------------------------------------------------------ #
    #  Disease Knowledge Base                                              #
    # ------------------------------------------------------------------ #
    # severity_tier  : mild | moderate | serious | critical
    # smoking_weight : multiplier applied when user smokes (1.0 = no effect)
    # sleep_sensitivity : low | medium | high | very_high
    # pollution_sensitivity : low | medium | high | very_high
    # lifestyle_tips : safe, non-diagnostic lifestyle suggestions
    # risk_note : single contextual awareness sentence
    # ------------------------------------------------------------------ #

    DISEASE_PROFILES = {
        # --- Critical ------------------------------------------------- #
        "Heart attack": {
            "severity_tier": "critical",
            "smoking_weight": 1.55,
            "sleep_sensitivity": "very_high",
            "pollution_sensitivity": "high",
            "lifestyle_tips": [
                "Include heart-healthy foods like leafy greens, whole grains, and omega-3 rich fish in your diet",
                "Aim for at least 30 minutes of moderate activity such as brisk walking most days",
                "Practice stress-management techniques like deep breathing or meditation",
            ],
            "risk_note": "Heart conditions are time-sensitive — early medical attention can be life-saving.",
        },
        "Paralysis (brain hemorrhage)": {
            "severity_tier": "critical",
            "smoking_weight": 1.50,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Keep blood pressure in check through a low-sodium, balanced diet",
                "Stay physically active within your comfort level",
                "Avoid excessive alcohol consumption",
            ],
            "risk_note": "Brain-related emergencies require immediate professional evaluation.",
        },
        "AIDS": {
            "severity_tier": "critical",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Maintain a nutrient-rich diet to support immune function",
                "Prioritize adequate rest and stress reduction",
                "Follow safe practices and consider regular testing if at risk",
            ],
            "risk_note": "Early diagnosis and medical management are crucial for long-term well-being.",
        },
        "Dengue": {
            "severity_tier": "critical",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Stay well-hydrated with water, oral rehydration salts, and clear fluids",
                "Use mosquito repellent and sleep under a mosquito net",
                "Rest as much as possible to support recovery",
            ],
            "risk_note": "Dengue can progress rapidly — monitoring platelet count and hydration is essential.",
        },

        # --- Serious -------------------------------------------------- #
        "Pneumonia": {
            "severity_tier": "serious",
            "smoking_weight": 1.45,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "very_high",
            "lifestyle_tips": [
                "Stay hydrated and use a humidifier to ease breathing",
                "Practice good hand hygiene and avoid crowded, poorly ventilated areas",
                "Ensure you are up to date on recommended vaccinations",
            ],
            "risk_note": "Pneumonia can become serious quickly, especially in older adults or those with weakened immunity.",
        },
        "Tuberculosis": {
            "severity_tier": "serious",
            "smoking_weight": 1.40,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "very_high",
            "lifestyle_tips": [
                "Eat a protein-rich diet to help your body fight infection",
                "Ensure good ventilation in living spaces",
                "Follow any prescribed treatment regimen without interruption",
            ],
            "risk_note": "TB requires sustained medical treatment — completing the full course is essential.",
        },
        "Hepatitis B": {
            "severity_tier": "serious",
            "smoking_weight": 1.15,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Avoid alcohol as it can accelerate liver damage",
                "Eat a balanced diet low in processed foods and saturated fats",
                "Get vaccinated if you haven't been, and encourage close contacts to do the same",
            ],
            "risk_note": "Hepatitis B can be managed effectively with medical supervision and regular liver monitoring.",
        },
        "Hepatitis C": {
            "severity_tier": "serious",
            "smoking_weight": 1.15,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Eliminate or significantly reduce alcohol intake",
                "Maintain a diet rich in fruits, vegetables, and lean protein",
                "Avoid sharing personal items like razors or toothbrushes",
            ],
            "risk_note": "Modern treatments for Hepatitis C have high cure rates — consult a specialist.",
        },
        "Hepatitis D": {
            "severity_tier": "serious",
            "smoking_weight": 1.15,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Avoid alcohol entirely to protect liver function",
                "Focus on nutrient-dense, liver-friendly foods",
                "Regular liver function tests help track progression",
            ],
            "risk_note": "Hepatitis D occurs alongside Hepatitis B — managing both is important.",
        },
        "Malaria": {
            "severity_tier": "serious",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Stay hydrated and rest to support your immune response",
                "Use insecticide-treated bed nets and mosquito repellent",
                "Seek treatment promptly — early antimalarial therapy is most effective",
            ],
            "risk_note": "Malaria can escalate rapidly if untreated — timely medical care saves lives.",
        },
        "Typhoid": {
            "severity_tier": "serious",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Drink only purified or boiled water",
                "Eat freshly cooked, hot meals and avoid street food temporarily",
                "Wash hands thoroughly before eating and after using the restroom",
            ],
            "risk_note": "Typhoid requires antibiotic treatment — self-medication can lead to resistance.",
        },
        "Hypoglycemia": {
            "severity_tier": "serious",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Eat small, frequent meals to maintain stable blood sugar",
                "Carry a quick sugar source like glucose tablets or juice",
                "Avoid skipping meals, especially before physical activity",
            ],
            "risk_note": "Severe hypoglycemia can cause loss of consciousness — know your warning signs.",
        },

        # --- Moderate ------------------------------------------------- #
        "Diabetes ": {
            "severity_tier": "moderate",
            "smoking_weight": 1.30,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Monitor carbohydrate intake and prefer whole grains over refined sugars",
                "Engage in regular light exercise like walking for 30 minutes daily",
                "Stay hydrated and limit sugary beverages",
            ],
            "risk_note": "Diabetes benefits greatly from early lifestyle changes — small habits make a big difference.",
        },
        "Hypertension ": {
            "severity_tier": "moderate",
            "smoking_weight": 1.40,
            "sleep_sensitivity": "very_high",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Reduce sodium intake — aim for less than 2,300 mg per day",
                "Incorporate potassium-rich foods like bananas, spinach, and sweet potatoes",
                "Practice relaxation techniques such as yoga or mindful breathing",
            ],
            "risk_note": "Hypertension is often called the 'silent killer' — regular monitoring is key.",
        },
        "Bronchial Asthma": {
            "severity_tier": "moderate",
            "smoking_weight": 1.50,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "very_high",
            "lifestyle_tips": [
                "Identify and avoid your specific asthma triggers (dust, pollen, smoke)",
                "Keep an air purifier in your bedroom and living spaces",
                "Practice breathing exercises to strengthen lung capacity",
            ],
            "risk_note": "Asthma management improves significantly with trigger avoidance and proper inhaler use.",
        },
        "Jaundice": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Stay well-hydrated with water and fresh fruit juices",
                "Eat light, easily digestible foods and avoid fried or oily meals",
                "Rest adequately to support liver recovery",
            ],
            "risk_note": "Jaundice is often a sign of an underlying condition — medical evaluation helps identify the cause.",
        },
        "hepatitis A": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Rest and avoid strenuous activity while recovering",
                "Eat small, nutritious meals and avoid fatty foods",
                "Practice strict hand hygiene to prevent spreading to others",
            ],
            "risk_note": "Hepatitis A usually resolves on its own, but medical follow-up ensures proper recovery.",
        },
        "Hepatitis E": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Drink clean, purified water — contaminated water is a common source",
                "Avoid alcohol until fully recovered",
                "Eat a balanced, liver-friendly diet rich in antioxidants",
            ],
            "risk_note": "Hepatitis E is typically self-limiting but can be serious in pregnant women.",
        },
        "Cervical spondylosis": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Maintain good posture, especially when using screens for extended periods",
                "Perform gentle neck stretches and strengthening exercises daily",
                "Use an ergonomic pillow that supports the natural curve of your neck",
            ],
            "risk_note": "Cervical spondylosis often improves with posture correction and physical therapy.",
        },
        "Peptic ulcer diseae": {
            "severity_tier": "moderate",
            "smoking_weight": 1.35,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Eat smaller, more frequent meals instead of large ones",
                "Avoid spicy, acidic, and fried foods that irritate the stomach lining",
                "Limit use of NSAIDs (ibuprofen, aspirin) — consult your doctor for alternatives",
            ],
            "risk_note": "Peptic ulcers are highly treatable — most cases respond well to medication and dietary changes.",
        },
        "Hyperthyroidism": {
            "severity_tier": "moderate",
            "smoking_weight": 1.15,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Eat calcium and vitamin D-rich foods to protect bone health",
                "Limit caffeine intake as it can worsen symptoms like racing heart",
                "Practice calming activities to manage anxiety and restlessness",
            ],
            "risk_note": "Hyperthyroidism is manageable with proper medical treatment and regular thyroid monitoring.",
        },
        "Hypothyroidism": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Include iodine-rich foods like seafood, dairy, and eggs in your diet",
                "Exercise regularly to combat fatigue and weight gain",
                "Take thyroid medication consistently, ideally on an empty stomach",
            ],
            "risk_note": "Hypothyroidism requires ongoing management — regular blood tests ensure proper dosing.",
        },
        "Chronic cholestasis": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Follow a low-fat diet to reduce stress on your liver and bile ducts",
                "Stay hydrated and include fiber-rich foods for digestive health",
                "Avoid alcohol and hepatotoxic substances",
            ],
            "risk_note": "Chronic cholestasis benefits from regular liver function monitoring and specialist care.",
        },
        "Osteoarthristis": {
            "severity_tier": "moderate",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Maintain a healthy weight to reduce stress on joints",
                "Engage in low-impact exercises like swimming, cycling, or tai chi",
                "Apply warm compresses to stiff joints in the morning to ease movement",
            ],
            "risk_note": "Osteoarthritis progression can be slowed with regular movement and weight management.",
        },
        "Alcoholic hepatitis": {
            "severity_tier": "moderate",
            "smoking_weight": 1.20,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Stop alcohol consumption completely — this is the most important step",
                "Eat a nutritious diet rich in vitamins, especially B-complex and folate",
                "Consider joining a support group for help with alcohol cessation",
            ],
            "risk_note": "The liver has remarkable healing ability — stopping alcohol can allow significant recovery.",
        },

        # --- Mild ----------------------------------------------------- #
        "Common Cold": {
            "severity_tier": "mild",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Stay hydrated with warm fluids like herbal tea, soup, and water",
                "Rest well and avoid overexertion while recovering",
                "Use steam inhalation or saline nasal spray to relieve congestion",
            ],
            "risk_note": "The common cold usually resolves within 7-10 days with proper self-care.",
        },
        "Acne": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Wash your face twice daily with a gentle, non-comedogenic cleanser",
                "Avoid touching your face and change pillowcases regularly",
                "Stay hydrated and include zinc-rich foods like nuts and seeds",
            ],
            "risk_note": "Acne is very common and manageable — consistent skincare routines yield the best results.",
        },
        "Allergy": {
            "severity_tier": "mild",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "high",
            "lifestyle_tips": [
                "Identify and avoid known allergens through an elimination approach",
                "Keep your living space clean and dust-free; use air purifiers",
                "Rinse sinuses with saline solution after exposure to outdoor allergens",
            ],
            "risk_note": "Allergies are your immune system's overreaction — identifying triggers is the first step to relief.",
        },
        "Fungal infection": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Keep affected areas clean and dry — fungi thrive in moist environments",
                "Wear breathable fabrics and change socks/underwear daily",
                "Avoid sharing personal items like towels, combs, or shoes",
            ],
            "risk_note": "Fungal infections are common and usually respond well to topical treatments.",
        },
        "GERD": {
            "severity_tier": "mild",
            "smoking_weight": 1.25,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Avoid eating within 2-3 hours of bedtime; elevate the head of your bed",
                "Limit trigger foods: caffeine, chocolate, citrus, tomatoes, and spicy food",
                "Eat smaller, more frequent meals rather than large portions",
            ],
            "risk_note": "GERD is manageable with dietary adjustments — chronic untreated reflux should be evaluated.",
        },
        "Gastroenteritis": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Rehydrate with oral rehydration salts, clear broths, or electrolyte drinks",
                "Follow the BRAT diet (bananas, rice, applesauce, toast) during recovery",
                "Wash hands frequently to prevent spread to others",
            ],
            "risk_note": "Gastroenteritis usually resolves within a few days — stay hydrated to prevent dehydration.",
        },
        "Migraine": {
            "severity_tier": "mild",
            "smoking_weight": 1.10,
            "sleep_sensitivity": "very_high",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Maintain a consistent sleep schedule — irregular sleep is a major trigger",
                "Stay hydrated and avoid skipping meals",
                "Identify personal triggers (certain foods, bright lights, stress) and keep a headache diary",
            ],
            "risk_note": "Migraines are a neurological condition — understanding your triggers is key to prevention.",
        },
        "Drug Reaction": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Keep a detailed record of all medications and any reactions you experience",
                "Always inform healthcare providers about previous drug reactions",
                "Read medication labels carefully and ask your pharmacist about interactions",
            ],
            "risk_note": "Drug reactions vary in severity — always report unexpected symptoms to your doctor.",
        },
        "Chicken pox": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Avoid scratching blisters — use calamine lotion or cool compresses for itch relief",
                "Stay isolated from others, especially pregnant women and newborns",
                "Keep fingernails short and clean to prevent secondary infection from scratching",
            ],
            "risk_note": "Chicken pox is highly contagious but usually mild — complications are rare in healthy individuals.",
        },
        "Impetigo": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Gently wash affected areas with mild soap and water, then pat dry",
                "Avoid touching sores and wash hands frequently",
                "Use separate towels and bedding to prevent spreading to family members",
            ],
            "risk_note": "Impetigo is a common skin infection that responds well to topical or oral antibiotics.",
        },
        "Urinary tract infection": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Drink plenty of water — at least 8 glasses daily — to flush bacteria",
                "Avoid holding urine for extended periods",
                "Wear cotton underwear and avoid irritating feminine products",
            ],
            "risk_note": "UTIs are very treatable but can spread to the kidneys if left untreated.",
        },
        "Varicose veins": {
            "severity_tier": "mild",
            "smoking_weight": 1.15,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Avoid prolonged standing or sitting — take breaks to walk and stretch",
                "Elevate your legs when resting to improve blood flow",
                "Wear compression stockings if recommended, especially during long travel",
            ],
            "risk_note": "Varicose veins are common and usually manageable — exercise improves circulation.",
        },
        "(vertigo) Paroymsal  Positional Vertigo": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "high",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Move slowly when changing positions, especially when getting out of bed",
                "Try the Epley maneuver (with guidance from a healthcare provider) to reposition inner ear crystals",
                "Avoid sudden head movements and stay hydrated",
            ],
            "risk_note": "Positional vertigo is usually benign and often resolves with specific head-positioning exercises.",
        },
        "Psoriasis": {
            "severity_tier": "mild",
            "smoking_weight": 1.20,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Moisturize skin frequently with fragrance-free, thick creams",
                "Avoid known triggers like stress, skin injuries, and certain medications",
                "Consider controlled sun exposure — moderate sunlight can improve symptoms",
            ],
            "risk_note": "Psoriasis is a chronic autoimmune condition — consistent management reduces flare-ups.",
        },
        "Dimorphic hemmorhoids(piles)": {
            "severity_tier": "mild",
            "smoking_weight": 1.05,
            "sleep_sensitivity": "low",
            "pollution_sensitivity": "low",
            "lifestyle_tips": [
                "Increase dietary fiber with fruits, vegetables, and whole grains to soften stools",
                "Drink plenty of water — at least 8 glasses daily",
                "Avoid straining during bowel movements and don't sit on the toilet for extended periods",
            ],
            "risk_note": "Hemorrhoids are very common and usually improve with dietary changes and proper hygiene.",
        },
        "Arthritis": {
            "severity_tier": "moderate",
            "smoking_weight": 1.20,
            "sleep_sensitivity": "medium",
            "pollution_sensitivity": "medium",
            "lifestyle_tips": [
                "Stay active with gentle exercises like swimming, walking, or yoga",
                "Apply hot or cold packs to affected joints for relief",
                "Include anti-inflammatory foods like turmeric, fatty fish, and berries in your diet",
            ],
            "risk_note": "Arthritis management combines movement, nutrition, and — when needed — medical treatment.",
        },
    }

    # Fallback profile for diseases not explicitly listed
    _DEFAULT_PROFILE = {
        "severity_tier": "moderate",
        "smoking_weight": 1.15,
        "sleep_sensitivity": "medium",
        "pollution_sensitivity": "medium",
        "lifestyle_tips": [
            "Maintain a balanced diet rich in fruits, vegetables, and whole grains",
            "Stay physically active with at least 30 minutes of moderate exercise daily",
            "Prioritize adequate sleep and stress management",
        ],
        "risk_note": "Maintaining healthy habits supports your body's natural ability to recover and stay resilient.",
    }

    # ------------------------------------------------------------------ #
    #  Sensitivity → multiplier mapping                                    #
    # ------------------------------------------------------------------ #

    _SLEEP_SENSITIVITY_SCALE = {
        "low": 0.5,
        "medium": 1.0,
        "high": 1.5,
        "very_high": 2.0,
    }

    _POLLUTION_SENSITIVITY_SCALE = {
        "low": 0.5,
        "medium": 1.0,
        "high": 1.5,
        "very_high": 2.0,
    }

    # Pollution label → base multiplier (before sensitivity scaling)
    _POLLUTION_MULTIPLIERS = {
        "very_low": 1.00,
        "low": 1.00,
        "moderate": 1.06,
        "high": 1.12,
        "very_high": 1.18,
    }

    # Map common frontend labels to internal values
    _POLLUTION_ALIASES = {
        "medium": "moderate",
    }

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def calculate_risk(self, base_probability, lifestyle_factors, disease):
        """Calculate adjusted disease probability based on lifestyle factors."""
        base_probability = float(base_probability)
        risk = base_probability
        factors = []

        profile = self.DISEASE_PROFILES.get(disease, self._DEFAULT_PROFILE)

        # --- Smoking -------------------------------------------------- #
        if lifestyle_factors.get("smoking", False):
            weight = profile["smoking_weight"]
            risk *= weight
            increase_pct = round((weight - 1) * 100)
            factors.append({
                "name": "Smoking",
                "impact": f"+{increase_pct}%",
                "description": self._smoking_description(disease, increase_pct),
            })

        # --- Sleep ---------------------------------------------------- #
        sleep_hours = float(lifestyle_factors.get("sleep_hours", 7))
        sleep_result = self._evaluate_sleep(sleep_hours, profile)
        if sleep_result:
            risk *= sleep_result["multiplier"]
            factors.append({
                "name": sleep_result["label"],
                "impact": sleep_result["impact"],
                "description": sleep_result["description"],
            })

        # --- Pollution ------------------------------------------------ #
        raw_pollution = lifestyle_factors.get(
            "pollution_level",
            lifestyle_factors.get("pollution", "low"),
        )
        pollution = self._POLLUTION_ALIASES.get(raw_pollution, raw_pollution)
        pollution_result = self._evaluate_pollution(pollution, profile)
        if pollution_result:
            risk *= pollution_result["multiplier"]
            factors.append({
                "name": pollution_result["label"],
                "impact": pollution_result["impact"],
                "description": pollution_result["description"],
            })

        risk = min(max(risk, 0.0), 0.95)

        # --- Build recommendations ------------------------------------ #
        recommendations = self._build_recommendations(
            disease, profile, lifestyle_factors, sleep_hours, pollution, factors, risk,
        )

        # --- Build risk breakdown for visualization ------------------- #
        risk_breakdown = self._build_risk_breakdown(base_probability, factors, risk)

        return {
            "disease": disease,
            "base_risk": round(base_probability, 4),
            "adjusted_risk": round(risk, 4),
            "base_risk_percent": round(base_probability * 100, 1),
            "adjusted_risk_percent": round(risk * 100, 1),
            "severity": self._get_severity(risk, profile),
            "disease_severity": profile["severity_tier"].capitalize(),
            "factors": factors,
            "recommendations": recommendations,
            "risk_breakdown": risk_breakdown,
        }

    def simulate_intervention(self, base_probability, current_lifestyle, disease, interventions):
        """Simulate risk reduction scenarios from lifestyle changes."""
        current = self.calculate_risk(base_probability, current_lifestyle, disease)

        scenarios = [
            {
                "name": "Current",
                "risk": current["adjusted_risk"],
                "risk_percent": current["adjusted_risk_percent"],
                "severity": current["severity"],
            }
        ]

        if current_lifestyle.get("smoking", False):
            lifestyle = dict(current_lifestyle)
            lifestyle["smoking"] = False
            result = self.calculate_risk(base_probability, lifestyle, disease)
            scenarios.append({
                "name": "Quit Smoking",
                "risk": result["adjusted_risk"],
                "risk_percent": result["adjusted_risk_percent"],
                "severity": result["severity"],
                "reduction": round(
                    current["adjusted_risk_percent"] - result["adjusted_risk_percent"], 1
                ),
            })

        if float(current_lifestyle.get("sleep_hours", 7)) < 7:
            lifestyle = dict(current_lifestyle)
            lifestyle["sleep_hours"] = 8
            result = self.calculate_risk(base_probability, lifestyle, disease)
            scenarios.append({
                "name": "Improve Sleep",
                "risk": result["adjusted_risk"],
                "risk_percent": result["adjusted_risk_percent"],
                "severity": result["severity"],
                "reduction": round(
                    current["adjusted_risk_percent"] - result["adjusted_risk_percent"], 1
                ),
            })

        raw_pollution = current_lifestyle.get(
            "pollution_level", current_lifestyle.get("pollution", "low")
        )
        pollution = self._POLLUTION_ALIASES.get(raw_pollution, raw_pollution)
        if pollution not in ("low", "very_low"):
            lifestyle = dict(current_lifestyle)
            lifestyle["pollution_level"] = "low"
            result = self.calculate_risk(base_probability, lifestyle, disease)
            scenarios.append({
                "name": "Reduce Pollution",
                "risk": result["adjusted_risk"],
                "risk_percent": result["adjusted_risk_percent"],
                "severity": result["severity"],
                "reduction": round(
                    current["adjusted_risk_percent"] - result["adjusted_risk_percent"], 1
                ),
            })

        best_lifestyle = dict(current_lifestyle)
        best_lifestyle["smoking"] = False
        best_lifestyle["sleep_hours"] = 8
        best_lifestyle["pollution_level"] = "low"
        best = self.calculate_risk(base_probability, best_lifestyle, disease)
        scenarios.append({
            "name": "All Improvements",
            "risk": best["adjusted_risk"],
            "risk_percent": best["adjusted_risk_percent"],
            "severity": best["severity"],
            "reduction": round(
                current["adjusted_risk_percent"] - best["adjusted_risk_percent"], 1
            ),
        })

        max_reduction = max(s.get("reduction", 0) for s in scenarios) if scenarios else 0

        return {
            "scenarios": scenarios,
            "current_risk": current["adjusted_risk_percent"],
            "best_case_risk": best["adjusted_risk_percent"],
            "max_reduction": round(max_reduction, 1),
        }

    # ------------------------------------------------------------------ #
    #  Private helpers                                                     #
    # ------------------------------------------------------------------ #

    def _smoking_description(self, disease, increase_pct):
        """Return a disease-contextual smoking impact description."""
        respiratory = {
            "Pneumonia", "Tuberculosis", "Bronchial Asthma", "Common Cold",
        }
        cardiovascular = {"Heart attack", "Hypertension ", "Varicose veins"}

        if disease in respiratory:
            return (
                f"Smoking significantly impacts respiratory health and may increase "
                f"susceptibility to {disease} (estimated +{increase_pct}% risk adjustment)"
            )
        if disease in cardiovascular:
            return (
                f"Smoking is a well-known contributor to cardiovascular conditions "
                f"(estimated +{increase_pct}% risk adjustment)"
            )
        return (
            f"Smoking can weaken overall immunity and affect recovery "
            f"(estimated +{increase_pct}% risk adjustment)"
        )

    def _evaluate_sleep(self, hours, profile):
        """Evaluate sleep quality with 5-level ranges and disease sensitivity."""
        sensitivity = self._SLEEP_SENSITIVITY_SCALE.get(
            profile.get("sleep_sensitivity", "medium"), 1.0
        )

        if hours < 4:
            base = 1.20
            scaled = 1 + (base - 1) * sensitivity
            return {
                "label": "Severe Sleep Deprivation",
                "multiplier": round(scaled, 3),
                "impact": f"+{round((scaled - 1) * 100)}%",
                "description": (
                    f"Getting only {hours}h of sleep is significantly below the recommended "
                    f"7-9 hours and can impair immune function, mood, and recovery"
                ),
            }
        elif hours < 5:
            base = 1.15
            scaled = 1 + (base - 1) * sensitivity
            return {
                "label": "Poor Sleep",
                "multiplier": round(scaled, 3),
                "impact": f"+{round((scaled - 1) * 100)}%",
                "description": (
                    f"Sleeping {hours}h is well below optimal — chronic short sleep is linked "
                    f"to weakened immunity and increased health risks"
                ),
            }
        elif hours < 6:
            base = 1.10
            scaled = 1 + (base - 1) * sensitivity
            return {
                "label": "Below Average Sleep",
                "multiplier": round(scaled, 3),
                "impact": f"+{round((scaled - 1) * 100)}%",
                "description": (
                    f"At {hours}h, your sleep is below the recommended 7-9 hours — "
                    f"even small improvements can meaningfully benefit your health"
                ),
            }
        elif hours < 7:
            base = 1.05
            scaled = 1 + (base - 1) * sensitivity
            if scaled > 1.01:
                return {
                    "label": "Slightly Below Optimal Sleep",
                    "multiplier": round(scaled, 3),
                    "impact": f"+{round((scaled - 1) * 100)}%",
                    "description": (
                        f"Sleeping {hours}h is close to optimal but adding another hour "
                        f"could further support your body's repair processes"
                    ),
                }
            return None  # negligible impact
        elif hours > 9:
            # Oversleeping can be a concern for some conditions
            base = 1.04
            scaled = 1 + (base - 1) * sensitivity
            if scaled > 1.01:
                return {
                    "label": "Excess Sleep",
                    "multiplier": round(scaled, 3),
                    "impact": f"+{round((scaled - 1) * 100)}%",
                    "description": (
                        f"Sleeping {hours}h is above the typical 7-9 hour range — "
                        f"oversleeping can sometimes indicate underlying health issues"
                    ),
                }
            return None
        return None  # 7-9 hours is optimal

    def _evaluate_pollution(self, pollution, profile):
        """Evaluate pollution exposure with disease-specific sensitivity."""
        base_mult = self._POLLUTION_MULTIPLIERS.get(pollution, 1.0)
        if base_mult <= 1.0:
            return None

        sensitivity = self._POLLUTION_SENSITIVITY_SCALE.get(
            profile.get("pollution_sensitivity", "medium"), 1.0
        )
        scaled = 1 + (base_mult - 1) * sensitivity
        increase_pct = round((scaled - 1) * 100)

        if increase_pct < 1:
            return None

        label_map = {
            "moderate": "Moderate Pollution Exposure",
            "high": "High Pollution Exposure",
            "very_high": "Very High Pollution Exposure",
        }

        desc_map = {
            "moderate": (
                f"Moderate air pollution can mildly stress the respiratory and immune system "
                f"(estimated +{increase_pct}% risk adjustment)"
            ),
            "high": (
                f"High pollution exposure is linked to increased respiratory and cardiovascular strain "
                f"(estimated +{increase_pct}% risk adjustment)"
            ),
            "very_high": (
                f"Very high pollution levels pose significant health risks — consider using air purifiers "
                f"indoors and N95 masks outdoors (estimated +{increase_pct}% risk adjustment)"
            ),
        }

        return {
            "label": label_map.get(pollution, "Pollution Exposure"),
            "multiplier": round(scaled, 3),
            "impact": f"+{increase_pct}%",
            "description": desc_map.get(
                pollution,
                f"Pollution exposure may affect health (estimated +{increase_pct}% risk adjustment)"
            ),
        }

    def _build_recommendations(self, disease, profile, lifestyle, sleep_hours, pollution, factors, risk):
        """
        Build a structured recommendation object with:
        - urgency + urgency_message
        - lifestyle tips (general)
        - risk_awareness (factor-specific contextual messages)
        - disease_specific (from the knowledge base)
        - disclaimer
        """
        tier = profile["severity_tier"]

        # --- Urgency -------------------------------------------------- #
        if tier == "critical":
            urgency = "visit_doctor_immediately"
            urgency_message = (
                "Based on the symptoms you've described, we strongly recommend "
                "seeking immediate medical attention. Please visit a hospital or "
                "contact emergency services without delay."
            )
        elif tier == "serious":
            urgency = "visit_doctor_immediately"
            urgency_message = (
                "This condition often requires professional medical treatment. "
                "Please consult a healthcare provider as soon as possible for "
                "proper diagnosis and care."
            )
        elif tier == "moderate":
            if risk >= 0.6:
                urgency = "consult_soon"
                urgency_message = (
                    "We recommend scheduling an appointment with your doctor within "
                    "the next few days for a professional evaluation and guidance."
                )
            else:
                urgency = "consult_soon"
                urgency_message = (
                    "Consider visiting a healthcare provider for a check-up to discuss "
                    "your symptoms and get personalized medical advice."
                )
        else:  # mild
            if risk >= 0.5:
                urgency = "monitor"
                urgency_message = (
                    "While this condition is typically manageable, your current risk "
                    "factors suggest it would be wise to monitor your symptoms closely "
                    "and consult a doctor if they worsen."
                )
            else:
                urgency = "routine"
                urgency_message = (
                    "This condition is generally manageable with self-care. Maintain "
                    "healthy habits and consult a doctor if symptoms persist or worsen."
                )

        # --- General lifestyle tips ----------------------------------- #
        lifestyle_tips = []

        # Sleep-based
        if sleep_hours < 5:
            lifestyle_tips.append(
                "Prioritize sleep — aim for 7-9 hours. Create a calming bedtime routine: "
                "reduce screen time 1 hour before bed, keep your room cool and dark"
            )
        elif sleep_hours < 7:
            lifestyle_tips.append(
                "Try to gradually increase your sleep to 7-8 hours — even 30 extra minutes "
                "can improve energy, mood, and immune function"
            )
        elif sleep_hours > 9:
            lifestyle_tips.append(
                "Sleeping more than 9 hours regularly may indicate underlying issues — "
                "try to maintain a consistent 7-9 hour sleep schedule"
            )
        else:
            lifestyle_tips.append(
                "Your sleep duration is within the healthy range — keep maintaining good sleep hygiene"
            )

        # General wellness
        lifestyle_tips.append(
            "Stay hydrated by drinking at least 8 glasses of water daily"
        )
        lifestyle_tips.append(
            "Include regular physical activity — even a 20-minute daily walk benefits overall health"
        )

        # --- Risk awareness messages ---------------------------------- #
        risk_awareness = []

        is_smoker = lifestyle.get("smoking", False)

        respiratory_diseases = {
            "Pneumonia", "Tuberculosis", "Bronchial Asthma", "Common Cold",
        }
        cardiovascular_diseases = {"Heart attack", "Hypertension ", "Varicose veins"}
        liver_diseases = {
            "Hepatitis B", "Hepatitis C", "Hepatitis D", "hepatitis A",
            "Hepatitis E", "Alcoholic hepatitis", "Jaundice", "Chronic cholestasis",
        }

        if is_smoker and disease in respiratory_diseases:
            risk_awareness.append(
                "Smoking is one of the leading aggravators of respiratory conditions. "
                "Even reducing the number of cigarettes can make a noticeable difference. "
                "Consider speaking with a healthcare provider about cessation programs."
            )
        elif is_smoker and disease in cardiovascular_diseases:
            risk_awareness.append(
                "Smoking significantly strains the cardiovascular system. Quitting smoking "
                "is one of the most impactful steps you can take for heart health. "
                "Benefits begin within hours of your last cigarette."
            )
        elif is_smoker:
            risk_awareness.append(
                "Smoking weakens overall immunity and slows healing. Reducing or quitting "
                "smoking supports better recovery and long-term health."
            )

        if sleep_hours < 6 and disease in (
            "Migraine", "Hypertension ", "Heart attack", "Diabetes ",
            "Hyperthyroidism", "Hypothyroidism", "Hypoglycemia",
        ):
            risk_awareness.append(
                "Chronic sleep deprivation is closely linked to hormonal imbalances and "
                "cardiovascular strain. Improving your sleep can have a meaningful "
                "positive effect on this condition."
            )

        if pollution in ("high", "very_high") and disease in respiratory_diseases:
            risk_awareness.append(
                "High air pollution directly irritates the respiratory system. "
                "Using an air purifier indoors and wearing an N95 mask during "
                "high-pollution days can help reduce symptom triggers."
            )
        elif pollution in ("high", "very_high"):
            risk_awareness.append(
                "Living in a high-pollution environment puts additional stress on your "
                "body. Consider using air purifiers and limiting outdoor activity on "
                "days when air quality is poor."
            )

        if disease in liver_diseases:
            risk_awareness.append(
                "Liver health is closely tied to what you consume. Avoiding alcohol, "
                "processed foods, and unnecessary medications helps protect liver function."
            )

        # Add the disease-specific risk note from the knowledge base
        if profile.get("risk_note"):
            risk_awareness.append(profile["risk_note"])

        # If no risk awareness messages generated, add a general one
        if not risk_awareness:
            risk_awareness.append(
                "Maintaining healthy habits supports your body's natural ability "
                "to recover and stay resilient."
            )

        # --- Disease-specific tips ------------------------------------ #
        disease_specific = list(profile.get("lifestyle_tips", []))

        # --- Disclaimer ----------------------------------------------- #
        disclaimer = (
            "This analysis is for informational and educational purposes only. "
            "It is not a medical diagnosis or substitute for professional medical advice. "
            "Always consult a qualified healthcare provider for proper diagnosis and treatment."
        )

        return {
            "urgency": urgency,
            "urgency_message": urgency_message,
            "lifestyle": lifestyle_tips,
            "risk_awareness": risk_awareness,
            "disease_specific": disease_specific,
            "disclaimer": disclaimer,
        }

    def _get_severity(self, risk, profile=None):
        """Get severity considering both risk score and inherent disease severity."""
        # Numeric risk-based severity
        if risk < 0.3:
            risk_severity = "Low"
        elif risk < 0.5:
            risk_severity = "Moderate"
        elif risk < 0.7:
            risk_severity = "High"
        else:
            risk_severity = "Critical"

        if profile is None:
            return risk_severity

        # Disease tier sets a minimum severity floor
        tier = profile.get("severity_tier", "moderate")
        severity_order = ["Low", "Moderate", "High", "Critical"]
        tier_floor_map = {
            "critical": "High",       # Critical diseases never show below High
            "serious": "Moderate",    # Serious diseases never show below Moderate
            "moderate": "Low",        # No floor
            "mild": "Low",            # No floor
        }
        floor = tier_floor_map.get(tier, "Low")

        # Return the higher of risk-based severity and the floor
        if severity_order.index(risk_severity) >= severity_order.index(floor):
            return risk_severity
        return floor

    def _build_risk_breakdown(self, base_probability, factors, final_risk):
        """Build waterfall-style risk breakdown data for visualization."""
        breakdown = []
        base_pct = round(base_probability * 100, 1)
        final_pct = round(final_risk * 100, 1)
        total_increase = round(final_pct - base_pct, 1)

        breakdown.append({
            "name": "Base Risk",
            "value": base_pct,
            "type": "base",
            "color": "#6366f1",
        })

        if factors:
            # Distribute the total increase proportionally across factors
            # based on their stated impact percentages
            raw_impacts = []
            for f in factors:
                try:
                    pct = float(f["impact"].replace("+", "").replace("%", ""))
                except (ValueError, AttributeError):
                    pct = 0
                raw_impacts.append(pct)

            impact_sum = sum(raw_impacts) if raw_impacts else 1
            for i, f in enumerate(factors):
                if impact_sum > 0 and total_increase > 0:
                    share = round((raw_impacts[i] / impact_sum) * total_increase, 1)
                else:
                    share = 0
                breakdown.append({
                    "name": f["name"],
                    "value": share,
                    "type": "factor",
                    "color": "#ef4444",
                })

        breakdown.append({
            "name": "Adjusted Risk",
            "value": final_pct,
            "type": "total",
            "color": "#f59e0b",
        })

        return breakdown
