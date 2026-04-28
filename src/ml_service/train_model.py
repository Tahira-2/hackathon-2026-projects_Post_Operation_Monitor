import pandas as pd 
import numpy as np 
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split 
from sklearn.preprocessing import LabelEncoder 
import joblib
import json

#load dataset 
print ("Loading dataset...")
df = pd.read_csv('Training.csv')

#Drop unnamed columns (from trailing commas) 
df = df.dropna(axis=1, how='all')
df - df[[col for col in df.columns if not col.startswith('Unnamed')]]


#Get symptom columns(all except prognosis which is the target)
y = df['prognosis']
symptom_columns = [col for col in df.columns if col != 'prognosis'] 
X = df[symptom_columns] 

#Encode disease labels 
label_encoder = LabelEncoder() 
y_encoded = label_encoder.fit_transform(y) 

#Split Data 
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

#Train Random Forest 
print ("Training RandomForest Model....")
model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=20) 
model.fit(X_train, y_train) 

#Evaluate 
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy * 100:.2f%}")

#Save model and metadata
print("Saving Model.........")
joblib.dump(model, 'ml_service/disease_model/pkl')
joblib.dump(label_encoder, 'ml_service/label_encoder.pkl')


#Save symptom list 
with open('ml_service/feature_mapping.json', 'w') as f: 
    json.dump(symptom_columns, f)

print('Model Training complete!')
print(f"Diseases in dataset: {len(label_encoder.classes_)}")