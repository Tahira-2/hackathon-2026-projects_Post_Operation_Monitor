"""
Popular Doctors in Nepal - Specialist Data
Categorized by specialty for triage recommendations.
"""

POPULAR_DOCTORS = {
    "Cardiologist": [
        {
            "name": "Dr. Arun Maskey",
            "name_ne": "डा. अरुण मास्के",
            "hospital": "Shahid Gangalal / Norvic",
            "hospital_ne": "शहीद गंगालाल / नर्भिक",
            "expertise": "Interventional Cardiology",
            "expertise_ne": "मुटु रोग विशेषज्ञ"
        },
        {
            "name": "Dr. Satish Kumar Singh",
            "name_ne": "डा. सतिश कुमार सिंह",
            "hospital": "Shahid Gangalal National Heart Centre",
            "hospital_ne": "शहीद गंगालाल राष्ट्रिय हृदय केन्द्र",
            "expertise": "Senior Consultant Cardiologist",
            "expertise_ne": "वरिष्ठ मुटु रोग विशेषज्ञ"
        }
    ],
    "Neurologist": [
        {
            "name": "Dr. Basant Pant",
            "name_ne": "डा. बसन्त पन्त",
            "hospital": "Annapurna Neuro Hospital",
            "hospital_ne": "अन्नपूर्ण न्युरो अस्पताल",
            "expertise": "Neurosurgeon",
            "expertise_ne": "नसा तथा टाउको रोग विशेषज्ञ"
        },
        {
            "name": "Dr. Babu Ram Pokharel",
            "name_ne": "डा. बाबु राम पोखरेल",
            "hospital": "Nepal Mediciti",
            "hospital_ne": "नेपाल मेडिसिटी",
            "expertise": "Senior Neurologist",
            "expertise_ne": "वरिष्ठ नसा रोग विशेषज्ञ"
        }
    ],
    "Gastroenterologist": [
        {
            "name": "Prof. Dr. Umid Kumar Shrestha",
            "name_ne": "प्रो. डा. उमिद कुमार श्रेष्ठ",
            "hospital": "Nepal Mediciti / Clinic One",
            "hospital_ne": "नेपाल मेडिसिटी / क्लिनिक वन",
            "expertise": "Senior Gastroenterologist",
            "expertise_ne": "पेट तथा कलेजो रोग विशेषज्ञ"
        },
        {
            "name": "Prof. Dr. Bidhan Nidhi Paudel",
            "name_ne": "प्रो. डा. बिधान निधि पौडेल",
            "hospital": "Tribhuvan University Teaching Hospital",
            "hospital_ne": "शिक्षण अस्पताल (TUTH)",
            "expertise": "Gastroenterology Specialist",
            "expertise_ne": "पेट तथा आन्द्रा रोग विशेषज्ञ"
        }
    ],
    "ENT Specialist": [
        {
            "name": "Prof. Dr. Toran KC",
            "name_ne": "प्रो. डा. तोरण केसी",
            "hospital": "Nepal Mediciti",
            "hospital_ne": "नेपाल मेडिसिटी",
            "expertise": "ENT & Head/Neck Surgeon",
            "expertise_ne": "नाक, कान, घाँटी विशेषज्ञ"
        },
        {
            "name": "Dr. Yogesh Neupane",
            "name_ne": "डा. योगेश न्यौपाने",
            "hospital": "TU Teaching Hospital / Frontline",
            "hospital_ne": "शिक्षण अस्पताल / फ्रन्टलाइन",
            "expertise": "ENT Specialist",
            "expertise_ne": "नाक, कान, घाँटी विशेषज्ञ"
        }
    ],
    "Pediatrician": [
        {
            "name": "Dr. Sujeeta Bhandari",
            "name_ne": "डा. सुजिता भण्डारी",
            "hospital": "Nepal Mediciti",
            "hospital_ne": "नेपाल मेडिसिटी",
            "expertise": "Consultant Pediatrician",
            "expertise_ne": "बाल रोग विशेषज्ञ"
        },
        {
            "name": "Dr. Yesha Amatya",
            "name_ne": "डा. यशा अमात्य",
            "hospital": "Clinic One / Kanti Children's",
            "hospital_ne": "क्लिनिक वन / कान्ति बाल अस्पताल",
            "expertise": "Pediatrics Specialist",
            "expertise_ne": "बाल रोग विशेषज्ञ"
        }
    ],
    "Pulmonologist": [
        {
            "name": "Dr. Arjun Mainali",
            "name_ne": "डा. अर्जुन मैनाली",
            "hospital": "HAMS Hospital",
            "hospital_ne": "ह्याम्स अस्पताल",
            "expertise": "Chest & Respiratory Specialist",
            "expertise_ne": "फोक्सो तथा श्वासप्रश्वास विशेषज्ञ"
        }
    ],
    "Ophthalmologist": [
        {
            "name": "Dr. Sanduk Ruit",
            "name_ne": "डा. सन्दुक रुइत",
            "hospital": "Tilganga Institute of Ophthalmology",
            "hospital_ne": "तिलगंगा आँखा प्रतिष्ठान",
            "expertise": "Senior Ophthalmologist",
            "expertise_ne": "वरिष्ठ आँखा रोग विशेषज्ञ"
        }
    ],
    "General Physician": [
        {
            "name": "Dr. Amit Singh",
            "name_ne": "डा. अमित सिंह",
            "hospital": "Nepal Mediciti",
            "hospital_ne": "नेपाल मेडिसिटी",
            "expertise": "Internal Medicine",
            "expertise_ne": "सामान्य चिकित्सा"
        },
        {
            "name": "Dr. Neeraj Pant",
            "name_ne": "डा. नीरज पन्त",
            "hospital": "Clinic One Kathmandu",
            "hospital_ne": "क्लिनिक वन काठमाडौं",
            "expertise": "Consultant Physician",
            "expertise_ne": "कन्सल्टेन्ट फिजिसियन"
        }
    ],
    "Emergency Medical Team": [
        {
            "name": "Emergency Care - TUTH",
            "name_ne": "आकस्मिक सेवा - शिक्षण अस्पताल",
            "hospital": "Tribhuvan University Teaching Hospital",
            "hospital_ne": "शिक्षण अस्पताल (TUTH)",
            "expertise": "24/7 Trauma & Emergency",
            "expertise_ne": "२४सै घण्टा आकस्मिक सेवा"
        },
        {
            "name": "Emergency Care - Mediciti",
            "name_ne": "आकस्मिक सेवा - मेडिसिटी",
            "hospital": "Nepal Mediciti Hospital",
            "hospital_ne": "नेपाल मेडिसिटी अस्पताल",
            "expertise": "Level-1 Trauma Center",
            "expertise_ne": "स्तर-१ ट्रमा सेन्टर"
        }
    ]
}
