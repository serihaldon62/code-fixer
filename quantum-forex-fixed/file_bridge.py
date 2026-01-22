import time
import os
import json
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
import numpy as np
import pandas as pd
from quantum_model import QuantumModel
from sklearn.preprocessing import MinMaxScaler

# ------------------------------------------------------------------
# LOGGING SETUP
# ------------------------------------------------------------------
def setup_logging(name, log_file='logs/bridge.log'):
    """Setup rotating file logger + console output."""
    os.makedirs('logs', exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # File handler (rotating, max 5MB, keep 5 backups)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5*1024*1024, backupCount=5, encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_format = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_format)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s', datefmt='%H:%M:%S')
    console_handler.setFormatter(console_format)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

log = setup_logging('bridge')

# ------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------
FILES_PATH = "" 
RESPONSE_FILE = "quantum_response.txt"
HEARTBEAT_FILE = "quantum_heartbeat.txt"
HEARTBEAT_INTERVAL = 30  # seconds

# Model & Health Globals
q_model = None
last_model_time = 0
last_heartbeat_time = 0
stats = {
    'requests_processed': 0,
    'signals_buy': 0,
    'signals_sell': 0,
    'signals_neutral': 0,
    'errors': 0,
    'start_time': datetime.now().isoformat()
}


def write_heartbeat():
    """Write heartbeat file for EA to check bridge is alive."""
    global last_heartbeat_time
    
    if time.time() - last_heartbeat_time < HEARTBEAT_INTERVAL:
        return
        
    try:
        heartbeat_path = os.path.join(FILES_PATH, HEARTBEAT_FILE)
        heartbeat_data = {
            'timestamp': datetime.now().isoformat(),
            'status': 'alive',
            'model_loaded': q_model is not None,
            'uptime_seconds': int(time.time() - stats.get('start_timestamp', time.time())),
            'stats': stats
        }
        with open(heartbeat_path, 'w') as f:
            json.dump(heartbeat_data, f, indent=2)
        last_heartbeat_time = time.time()
        log.debug(f"Heartbeat written: {heartbeat_path}")
    except Exception as e:
        log.warning(f"Could not write heartbeat: {e}")


def load_quantum_model():
    global q_model, last_model_time
    model_path = 'model.pkl'
    
    if os.path.exists(model_path):
        try:
            file_mtime = os.path.getmtime(model_path)
            if file_mtime > last_model_time:
                log.info(f"Loading/Reloading Model (modified: {datetime.fromtimestamp(file_mtime)})")
                q_model = QuantumModel(num_qubits=4, maxiter=1)
                q_model.load(model_path)
                last_model_time = file_mtime
                
                # Log quantum circuit info
                log.info(f"✓ Quantum Model loaded successfully")
                log.info(f"  - Qubits: {q_model.num_qubits}")
                log.info(f"  - Feature map: ZZFeatureMap (entanglement encoding)")
                log.info(f"  - Ansatz: RealAmplitudes (variational layer)")
                log.info(f"  - Parameters: {len(q_model.ansatz.parameters)} trainable weights")
                return True
        except Exception as e:
            log.error(f"Error loading model: {e}")
            stats['errors'] += 1
            return False
    else:
        log.warning("Waiting for model.pkl to be created by trainer...")
        return False
    
    return True


def read_request_file(filepath, max_retries=5, retry_delay=0.1):
    """Read JSON request with retry for partial writes."""
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
    
    log.info(f"Processing request from {file_path}")
    
    try:
        # 1. Read Data
        data = read_request_file(file_path)
        
        if data is None:
            log.warning("Could not read request file")
            return

        closes = data.get('closes', [])
        
        if len(closes) < 30:
            log.warning(f"Not enough data in request: {len(closes)} bars (need 30+)")
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
        
        last_row = scaled_data[-1] 
        X_input = np.array([last_row])
        
        # 3. QUANTUM PREDICTION
        if q_model is None:
            log.error("Model not loaded!")
            return

        log.info("=" * 50)
        log.info("QUANTUM INFERENCE")
        log.info("=" * 50)
        log.info(f"Input features (scaled 0-2π):")
        log.info(f"  Close:   {X_input[0][0]:.4f}")
        log.info(f"  Returns: {X_input[0][1]:.4f}")
        log.info(f"  RSI:     {X_input[0][2]:.4f}")
        log.info(f"  MACD:    {X_input[0][3]:.4f}")
        
        # Get quantum probabilities
        start_time = time.time()
        raw_output = q_model.predict_proba(X_input)
        inference_time = (time.time() - start_time) * 1000
        
        log.info(f"Quantum circuit executed in {inference_time:.1f}ms")
        log.info(f"Raw quantum output: {raw_output}")
        
        # =====================================================================
        # QUANTUM OUTPUT INTERPRETATION
        # The NeuralNetworkClassifier uses a quantum circuit with:
        # - ZZFeatureMap: encodes classical data into quantum states via entanglement
        # - RealAmplitudes ansatz: trainable rotation gates
        # - Z-observable measurement: collapses quantum state to classical prediction
        #
        # The output can be:
        # 1. Raw expectation value [-1, +1] from Z-observable (single float)
        # 2. Sklearn-style probabilities [P(down), P(up)] (two floats)
        #
        # We detect the format and convert accordingly.
        # =====================================================================
        
        # Flatten and get the output
        raw_flat = np.array(raw_output).flatten()
        
        if len(raw_flat) == 1:
            # Single expectation value in range [-1, +1]
            # Convert to probabilities: P(up) = (value + 1) / 2
            expectation = float(raw_flat[0])
            # Clamp to valid range
            expectation = max(-1.0, min(1.0, expectation))
            p_up = (expectation + 1.0) / 2.0
            p_down = 1.0 - p_up
            log.info(f"Expectation value: {expectation:.4f} -> P(UP)={p_up:.4f}, P(DOWN)={p_down:.4f}")
        elif len(raw_flat) >= 2:
            # Standard sklearn format [P(down), P(up)]
            p_down = float(raw_flat[0])
            p_up = float(raw_flat[1])
            # Normalize if needed
            total = p_down + p_up
            if total > 0:
                p_down /= total
                p_up /= total
        else:
            # Fallback
            p_down, p_up = 0.5, 0.5
        
        log.info(f"Quantum probabilities: P(DOWN)={p_down:.4f}, P(UP)={p_up:.4f}")
        
        # Determine signal
        if p_up > p_down:
            signal = 1  # BUY
            stats['signals_buy'] += 1
        elif p_down > p_up:
            signal = -1  # SELL
            stats['signals_sell'] += 1
        else:
            signal = 0
            stats['signals_neutral'] += 1
            
        confidence = max(p_up, p_down)
        
        # Minimum threshold
        MIN_CONFIDENCE = 0.55
        if confidence < MIN_CONFIDENCE:
            log.info(f"Confidence {confidence:.4f} below threshold {MIN_CONFIDENCE}, setting NEUTRAL")
            signal = 0
            stats['signals_neutral'] += 1
            
        signal_str = {1: "BUY 📈", -1: "SELL 📉", 0: "NEUTRAL ⏸️"}[signal]
        log.info(f"DECISION: {signal_str} (confidence: {confidence:.2%})")
        log.info("=" * 50)
        
        # 4. Write Response
        resp_data = {
            "signal": signal,
            "confidence": confidence,
            "p_up": p_up,
            "p_down": p_down,
            "quantum_inference_ms": inference_time,
            "timestamp": datetime.now().isoformat()
        }
        
        resp_path = os.path.join(FILES_PATH, RESPONSE_FILE)
        
        with open(resp_path, 'w') as f:
            json.dump(resp_data, f)
            
        log.info(f"Response written to {resp_path}")
        stats['requests_processed'] += 1
        
        # 5. Clean up Request
        try:
            os.remove(file_path)
        except:
            pass
            
    except Exception as e:
        log.error(f"Error processing request: {e}")
        stats['errors'] += 1
        import traceback
        log.debug(traceback.format_exc())


def main():
    global FILES_PATH
    stats['start_timestamp'] = time.time()
    
    log.info("=" * 60)
    log.info("   QUANTUM FOREX FILE BRIDGE - STARTED")
    log.info("=" * 60)
    log.info("Features: Logging | Heartbeat | Quantum Verification")
    log.info("-" * 60)
    
    # Check for config
    config_file = "bridge_config.txt"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            FILES_PATH = f.read().strip()
            log.info(f"Loaded MT4 path from config: {FILES_PATH}")
    
    if not FILES_PATH or not os.path.exists(FILES_PATH):
        log.warning("MT4 Files path not configured!")
        print("\nPlease enter the full path to your MT4 Files folder:")
        print("Example: C:\\Users\\You\\AppData\\Roaming\\MetaQuotes\\Terminal\\...\\MQL4\\Files")
        FILES_PATH = input("Path: ").strip().replace('"', '')
        
        with open(config_file, 'w') as f:
            f.write(FILES_PATH)
            
    log.info(f"Monitoring: {FILES_PATH}")
    log.info(f"Heartbeat interval: {HEARTBEAT_INTERVAL}s")
    log.info("-" * 60)
    
    while True:
        try:
            # Reload model if needed
            load_quantum_model()
            
            # Write heartbeat for EA
            write_heartbeat()
            
            # Check for requests
            req_path = os.path.join(FILES_PATH, "quantum_request.txt")
            
            if os.path.exists(req_path):
                process_request(req_path)
                
        except KeyboardInterrupt:
            log.info("Shutdown requested by user")
            break
        except Exception as e:
            log.error(f"Main loop error: {e}")
            stats['errors'] += 1
            
        time.sleep(0.5)
    
    log.info("Bridge stopped. Final stats:")
    log.info(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
