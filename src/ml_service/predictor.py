import joblib 
import json 
import numpy as np 
import pandas as pd 

class DiseasePredictor: 
    def __init__(self): 
        self.model = joblib.load('ml_service/disease_model.pkl')
        self.label_encoder = joblib.load('ml_service/label_encoder.pkl') 
        with open('ml_service/feature_mapping.json', 'r') as f: 
            self.symptoms = json.load(f) 


    def predict(self, symptom_dict): 
        """ 
        Predict disease based on symptoms
        symptom_dict: dict of symptom name to boolean (True if present, False if not)
        """

        #Creating feature vector 
        features = np.zeros(len(self.symptoms)) 
        for i, symptom in enumerate(self.symptoms): 
            if symptom in symptom_dict and symptom_dict[symptom] ==1: 
                features[i] = 1


        #Convert to DataFrame for model input
        features_df = pd.DataFrame([features], columns=self.symptoms)

        #Predict disease 
        prediction = self.model.predict(features_df)[0] 
        probabilities = self.model.predict_proba(features_df)[0] 

        disease = self.label_encoder.inverse_transform([prediction])[0] 
        confidence = float(probabilities[prediction])

        return { 
            'disease': disease, 
            'confidence': confidence, 
            'probability_percent': round(confidence * 100, 2) 
        }
    
    def get_symptoms(self): 
        return self.symptoms
