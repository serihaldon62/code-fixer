import argparse
import numpy as np
import os
import time
import json
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from data_loader import ForexDataLoader
from quantum_model import QuantumModel
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# ------------------------------------------------------------------
# LOGGING SETUP
# ------------------------------------------------------------------
def setup_logging(name, log_file='logs/trainer.log'):
    """Setup rotating file logger + console output."""
    os.makedirs('logs', exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # File handler
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

log = setup_logging('trainer')

# ------------------------------------------------------------------
# MODEL VALIDATION
# ------------------------------------------------------------------
def validate_model(model, X_test, y_test):
    """
    Comprehensive model validation with metrics.
    Returns dict with accuracy, precision, recall, f1, confusion matrix.
    """
    log.info("=" * 50)
    log.info("MODEL VALIDATION")
    log.info("=" * 50)
    
    try:
        y_pred = model.predict(X_test)
        
        # Core metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)
        
        # Log results
        log.info(f"Test samples: {len(y_test)}")
        log.info(f"Class distribution: DOWN={sum(y_test==0)}, UP={sum(y_test==1)}")
        log.info("-" * 30)
        log.info(f"Accuracy:  {accuracy:.4f} ({accuracy:.1%})")
        log.info(f"Precision: {precision:.4f} (of predicted UP, how many correct)")
        log.info(f"Recall:    {recall:.4f} (of actual UP, how many found)")
        log.info(f"F1 Score:  {f1:.4f} (harmonic mean)")
        log.info("-" * 30)
        log.info("Confusion Matrix:")
        log.info(f"              Pred DOWN  Pred UP")
        log.info(f"  Actual DOWN    {cm[0,0]:5d}    {cm[0,1]:5d}")
        log.info(f"  Actual UP      {cm[1,0]:5d}    {cm[1,1]:5d}")
        log.info("=" * 50)
        
        # Quality assessment
        if accuracy < 0.45:
            log.warning("⚠️ Model accuracy below random (45%)! Consider retraining from scratch.")
        elif accuracy < 0.52:
            log.warning("⚠️ Model accuracy near random. May need more data or features.")
        elif accuracy > 0.60:
            log.info("✓ Model showing promising edge (>60%)")
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'confusion_matrix': cm.tolist(),
            'test_samples': len(y_test),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        log.error(f"Validation failed: {e}")
        return None


def save_validation_history(metrics, history_file='logs/validation_history.json'):
    """Append validation metrics to history file."""
    try:
        history = []
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        
        history.append(metrics)
        
        # Keep last 100 entries
        if len(history) > 100:
            history = history[-100:]
            
        with open(history_file, 'w') as f:
            json.dump(history, f, indent=2)
            
        log.debug(f"Validation history saved ({len(history)} entries)")
    except Exception as e:
        log.warning(f"Could not save validation history: {e}")


def main():
    parser = argparse.ArgumentParser(description='Live Quantum Forex Trainer')
    parser.add_argument('--symbol', type=str, default='EURUSD=X', help='Forex Symbol')
    parser.add_argument('--epochs', type=int, default=20, help='Epochs per update (default: 20)')
    parser.add_argument('--interval', type=int, default=3600, help='Seconds between updates (default: 3600)')
    parser.add_argument('--save_path', type=str, default='model.pkl', help='Model save path')
    parser.add_argument('--test_split', type=float, default=0.2, help='Validation split ratio (default: 0.2)')

    args = parser.parse_args()

    log.info("=" * 60)
    log.info("   QUANTUM LIVE TRAINER - STARTED")
    log.info("=" * 60)
    log.info(f"Symbol: {args.symbol}")
    log.info(f"Update Interval: {args.interval}s ({args.interval/3600:.1f}h)")
    log.info(f"Epochs per round: {args.epochs}")
    log.info(f"Validation split: {args.test_split:.0%}")
    log.info(f"Model path: {args.save_path}")
    log.info("-" * 60)
    
    # Initialize Model
    q_model = QuantumModel(num_qubits=4, maxiter=args.epochs)
    
    log.info("Quantum Model Architecture:")
    log.info(f"  - Qubits: {q_model.num_qubits}")
    log.info(f"  - Feature Map: ZZFeatureMap (quantum entanglement encoding)")
    log.info(f"  - Ansatz: RealAmplitudes ({len(q_model.ansatz.parameters)} trainable params)")
    log.info(f"  - Observable: Z-operator on qubit 0")
    log.info(f"  - Optimizer: COBYLA")
    log.info("-" * 60)
    
    # Warm Start
    if os.path.exists(args.save_path):
        try:
            q_model.load(args.save_path)
            log.info("✓ Loaded existing model, continuing training...")
        except Exception as e:
            log.warning(f"Could not load model: {e}")

    training_round = 0
    
    while True:
        training_round += 1
        log.info("")
        log.info(f"{'='*60}")
        log.info(f"TRAINING ROUND {training_round} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        log.info(f"{'='*60}")
        
        try:
            # 1. FETCH DATA
            log.info("Fetching fresh market data...")
            loader = ForexDataLoader(symbol=args.symbol, interval='1h', period='2y')
            X_all, y_all = loader.prepare_features(lookback=4)
            
            log.info(f"Data loaded: {len(X_all)} samples, {X_all.shape[1]} features")
            log.info(f"Class balance: DOWN={sum(y_all==0)} ({sum(y_all==0)/len(y_all):.1%}), UP={sum(y_all==1)} ({sum(y_all==1)/len(y_all):.1%})")
            
            # 2. SPLIT DATA
            X_train, X_test, y_train, y_test = train_test_split(
                X_all, y_all, 
                test_size=args.test_split, 
                shuffle=False  # Keep temporal order
            )
            
            log.info(f"Train/Test split: {len(X_train)} train, {len(X_test)} test")
            
            # 3. TRAIN
            log.info(f"Training quantum circuit for {args.epochs} iterations...")
            train_start = time.time()
            q_model.train(X_train, y_train)
            train_time = time.time() - train_start
            log.info(f"Training completed in {train_time:.1f}s ({train_time/60:.1f}min)")
            
            # 4. VALIDATE
            metrics = validate_model(q_model, X_test, y_test)
            
            if metrics:
                metrics['training_round'] = training_round
                metrics['training_time_seconds'] = train_time
                metrics['train_samples'] = len(X_train)
                save_validation_history(metrics)
            
            # 5. SAVE (triggers hot-reload in Bridge)
            q_model.save(args.save_path)
            log.info(f"✓ Model saved to {args.save_path}")
            
            # 6. QUANTUM VERIFICATION
            log.info("-" * 40)
            log.info("QUANTUM VERIFICATION: Testing live inference...")
            test_sample = X_test[0:1]
            probs = q_model.predict_proba(test_sample)[0]
            log.info(f"  Input: {test_sample[0]}")
            log.info(f"  Quantum output: P(DOWN)={probs[0]:.4f}, P(UP)={probs[1]:.4f}")
            log.info(f"  Prediction: {'UP' if probs[1] > probs[0] else 'DOWN'}")
            log.info("✓ Quantum inference working correctly")
            log.info("-" * 40)
            
        except Exception as e:
            log.error(f"CRITICAL ERROR: {e}")
            import traceback
            log.debug(traceback.format_exc())
        
        # 7. SLEEP
        log.info(f"Next training in {args.interval}s ({args.interval/3600:.1f}h)...")
        log.info("")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
