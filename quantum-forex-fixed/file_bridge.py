import time
import os
import json
import numpy as np
import pandas as pd
from quantum_model import QuantumModel
from sklearn.preprocessing import MinMaxScaler

# ------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------
FILES_PATH = "" 
RESPONSE_FILE = "quantum_response.txt"

# Model Globals
q_model = None
last_model_time = 0

def load_quantum_model():
    global q_model, last_model_time
    model_path = 'model.pkl'
    
    if os.path.exists(model_path):
        try:
            file_mtime = os.path.getmtime(model_path)
            if file_mtime > last_model_time:
                print(f"Loading/Reloading Model (ts: {file_mtime})...")
                q_model = QuantumModel(num_qubits=4, maxiter=1)
                q_model.load(model_path)
                last_model_time = file_mtime
                print("Model loaded successfully.")
                return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    else:
        print("Waiting for model.pkl to be created by trainer...")
        return False
    
    return True


def read_request_file(filepath, max_retries=5, retry_delay=0.1):
    """
    Read JSON request with retry for partial writes.
    FIX: Proper JSON error handling instead of just checking length.
    """
    for attempt in range(max_retries):
        try:
            with open(filepath, 'r') as f:
                content = f.read()
            if len(content) < 5:
                time.sleep(retry_delay)
                continue
            return json.loads(content)
        except json.JSONDecodeError:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise
        except Exception:
            time.sleep(retry_delay)
    return None


def process_request(file_path):
    global q_model
    
    print(f"Processing request from {file_path}...")
    
    try:
        # 1. Read Data with proper JSON handling
        data = read_request_file(file_path)
        
        if data is None:
            print("Could not read request file.")
            return

        closes = data.get('closes', [])
        
        if len(closes) < 30:
            print("Not enough data in request.")
            return
            
        # 2. Prepare Features
        df = pd.DataFrame({'Close': closes})
        df['Returns'] = df['Close'].pct_change()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp12 = df['Close'].ewm(span=12, adjust=False).mean()
        exp26 = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = exp12 - exp26
        
        df.dropna(inplace=True)
        
        # Scale
        feature_cols = ['Close', 'Returns', 'RSI', 'MACD']
        data_values = df[feature_cols].values
        
        scaler = MinMaxScaler(feature_range=(0, 2 * np.pi))
        scaled_data = scaler.fit_transform(data_values)
        
        # Use only the LAST row (T-0 features)
        last_row = scaled_data[-1] 
        X_input = np.array([last_row])
        
        # 3. Predict
        if q_model is None:
            print("Model not loaded!")
            return

        print("Calculating Prediction...")
        probs = q_model.predict_proba(X_input)[0]
        print(f"Raw Probs: {probs}")
        
        # =====================================================================
        # FIX #1 (CRITICAL): Correct handling of predict_proba output
        # =====================================================================
        # NeuralNetworkClassifier.predict_proba() returns sklearn-style probabilities:
        # - If 2 classes: [P(class0), P(class1)] where values are already 0..1
        # - P(class0) = P(down), P(class1) = P(up)
        #
        # OLD WRONG CODE:
        #   raw_val = probs[0]
        #   p_up = (raw_val + 1) / 2  # This wrongly assumed -1..+1 range!
        #
        # This caused confidence to always be >= 0.5 and signals to be biased.
        # =====================================================================
        
        if len(probs) >= 2:
            # Standard sklearn format: [P(down), P(up)]
            p_down = float(probs[0])
            p_up = float(probs[1])
        else:
            # Fallback for 1D output (single probability for class 1)
            p_up = float(probs[0])
            p_down = 1.0 - p_up
        
        # Determine signal based on which probability is higher
        if p_up > p_down:
            signal = 1  # BUY
        elif p_down > p_up:
            signal = -1  # SELL
        else:
            signal = 0  # NEUTRAL
            
        # Confidence = the dominant probability
        confidence = max(p_up, p_down)
        
        # Optional: Add minimum threshold to avoid noise trades
        MIN_CONFIDENCE = 0.55
        if confidence < MIN_CONFIDENCE:
            signal = 0
            
        print(f"Prediction: Signal={signal}, P_Up={p_up:.4f}, P_Down={p_down:.4f}, Confidence={confidence:.4f}")
        
        # 4. Write Response
        resp_data = {
            "signal": signal,
            "confidence": confidence
        }
        
        resp_path = os.path.join(FILES_PATH, RESPONSE_FILE)
        
        with open(resp_path, 'w') as f:
            json.dump(resp_data, f)
            
        print(f"Response written to {resp_path}")
        
        # 5. Clean up Request
        try:
            os.remove(file_path)
            print("Request processed and deleted.")
        except:
            pass
            
    except Exception as e:
        print(f"Error processing request: {e}")
        import traceback
        traceback.print_exc()


def main():
    global FILES_PATH
    
    print("-------------------------------------------------")
    print("      Quantum Forex FILE BRIDGE (FIXED)          ")
    print("-------------------------------------------------")
    print("This bridge reads data files from MT4, predicts,")
    print("and writes the result back.")
    print("NETWORK FREE MODE.")
    print("-------------------------------------------------")
    
    # Check for config
    config_file = "bridge_config.txt"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            FILES_PATH = f.read().strip()
            print(f"Loaded MT4 Files Path from config: {FILES_PATH}")
    
    if not FILES_PATH or not os.path.exists(FILES_PATH):
        print("\nIMPORTANT: Please enter the full path to your MT4 Files folder.")
        print("Example: C:\\Users\\You\\AppData\\Roaming\\MetaQuotes\\Terminal\\...\\MQL4\\Files")
        print("(You can find this in MT4 -> File -> Open Data Folder -> MQL4 -> Files)")
        FILES_PATH = input("Path: ").strip().replace('"', '')
        
        # Save for next time
        with open(config_file, 'w') as f:
            f.write(FILES_PATH)
            
    print(f"\nMonitoring {FILES_PATH} for requests...")
    
    while True:
        # Reload model if needed
        load_quantum_model()
        
        req_path = os.path.join(FILES_PATH, "quantum_request.txt")
        
        if os.path.exists(req_path):
            process_request(req_path)
            
        time.sleep(0.5)


if __name__ == "__main__":
    main()
