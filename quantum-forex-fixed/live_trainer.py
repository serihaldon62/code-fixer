import argparse
import numpy as np
import os
import time
import pandas as pd
from data_loader import ForexDataLoader
from quantum_model import QuantumModel


def main():
    parser = argparse.ArgumentParser(description='Live Quantum Forex Trainer')
    parser.add_argument('--symbol', type=str, default='EURUSD=X', help='Forex Symbol')
    parser.add_argument('--epochs', type=int, default=20, help='Epochs per update round (default: 20)')
    parser.add_argument('--interval', type=int, default=3600, help='Seconds between updates (default: 3600/1h)')
    parser.add_argument('--save_path', type=str, default='model.pkl', help='Path to save model')

    args = parser.parse_args()

    print(f"=== QUANTUM LIVE TRAINER STARTED (FIXED) ===")
    print(f"Symbol: {args.symbol}")
    print(f"Update Interval: {args.interval} seconds")
    print(f"Target Model: {args.save_path}")
    
    # Initialize Model Structure
    # FIX: Removed num_features parameter (was unused anyway)
    q_model = QuantumModel(num_qubits=4, maxiter=args.epochs)
    
    # Warm Start if exists
    if os.path.exists(args.save_path):
        try:
            q_model.load(args.save_path)
            print(">> Loaded existing model. Continuing training...")
        except Exception as e:
            print(f"Could not load existing model: {e}")

    while True:
        try:
            print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Fetching fresh data...")
            
            # 1. FETCH FRESH DATA
            loader = ForexDataLoader(symbol=args.symbol, interval='1h', period='2y')
            X_train, y_train = loader.prepare_features(lookback=4)
            
            # FIX: data_loader.py now returns 4 features directly,
            # no need to slice X_train[:, -4:] anymore!
            # The old code was confusing because prepare_features returned 16 features
            # (flattened lookback) but we only used the last 4.
            
            print(f"Data prepared. Samples: {len(X_train)}, Features: {X_train.shape[1]}")
            
            # Verify dimension match
            if X_train.shape[1] != 4:
                print(f"WARNING: Expected 4 features, got {X_train.shape[1]}!")
            
            # 2. TRAIN
            print(f"Training for {args.epochs} epochs...")
            q_model.train(X_train, y_train)
            
            # 3. SAVE (Triggers Hot-Reload in Bridge)
            q_model.save(args.save_path)
            print(f">> Model updated and saved to {args.save_path}")
            
        except Exception as e:
            print(f"CRITICAL ERROR in training loop: {e}")
            import traceback
            traceback.print_exc()
        
        # 4. SLEEP
        print(f"Sleeping for {args.interval} seconds...")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
