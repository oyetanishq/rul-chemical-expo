import os
import numpy as np
import joblib
from bottle_cors_plugin import cors_plugin
from bottle import route, run, request, app
from tensorflow.keras.models import load_model

app = app()
app.install(cors_plugin("*"))

MODEL_PATH = os.path.join(os.getcwd(), "model", "rul-model.keras")
SCALER_PATH = os.path.join(os.getcwd(), "model", "scaler.pkl")

model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Receives data for RUL predection
@route('/predict', method='POST')
def upload():
    try:
        data = request.json
        features = [
            data['cycle_index'],
            data['discharge_time'],
            data['decrement'],
            data['max_voltage_discharge'],
            data['min_voltage_dcharge'],
            data['time_at_4_15'],
            data['time_constant_current'],
            data['charging_time']
        ]

        # Convert to numpy array and scale
        X = np.array(features).reshape(1, -1)
        X_scaled = scaler.transform(X)

        # Predict RUL
        rul_pred = model.predict(X_scaled)
        rul_value = float(rul_pred[0][0])

        return {'predicted_rul': rul_value}

    except Exception as e:
        return {'error': str(e)}

# Super-Duper important function
@route('/', method='GET')
def home():
    return 'helloworld'

if __name__ == '__main__':
    run(host='0.0.0.0', port=3000)