=== QUANTUM FOREX TRADING SYSTEM - DEPLOYMENT GUIDE ===
=== FIXED VERSION ===

This package contains everything needed to install the Continuous Learning System on a new Windows Server.

=== CHANGELOG (FIXES APPLIED) ===

1. CRITICAL: file_bridge.py - Fixed predict_proba handling
   - OLD: Assumed output was -1 to +1 expectation value
   - NEW: Correctly handles sklearn-style [P(down), P(up)] probabilities
   - IMPACT: Signals and confidence now calculated correctly

2. data_loader.py - Simplified feature preparation
   - OLD: Created 16 flattened features, then sliced to 4
   - NEW: Directly returns 4 features per sample
   - IMPACT: Cleaner code, no confusion about dimensions

3. QuantumFileClient3.mq4 - Fixed StopLoss default
   - OLD: StopLossPoints = 2000 (200 pips!)
   - NEW: StopLossPoints = 500 (50 pips)
   - IMPACT: Matches README documentation

4. quantum_model.py - Removed unused num_features parameter
   - The parameter was never actually used in feature map
   - IMPACT: Cleaner API, no confusion

5. requirements.txt - Removed unused packages
   - Removed flask, flask-cors, gunicorn (not used in file bridge)

=== 1. INSTALL PYTHON ===
Download and install Python 3.10+ (Check "Add Python to PATH" during install).
Open cmd and verify:
> python --version

=== 2. SETUP ENVIRONMENT ===
1. Create a folder (e.g., C:\QuantumTrading) and copy ALL these files there.
2. Open cmd in that folder.
3. Install dependencies:
   > pip install -r requirements.txt

=== 3. CONFIGURE MT4 ===
1. Copy 'QuantumFileClient3.mq4' to your MT4 Data Folder -> MQL4/Experts.
2. Compile it in MetaEditor.
3. Open MT4, drag the EA to a EURUSD H1 chart.
4. IMPORTANT Settings:
   - LookbackCandles = 50
   - StopLossPoints = 500 (which means 50 pips on 5-digit broker)
   - TakeProfitPoints = 0 (or set your preferred TP)

=== 4. START THE SYSTEM ===
Option A (Manual):
Double-click 'auto_start.bat'.

Option B (Automatic on Reboot):
1. Press Win+R, type 'shell:startup', press Enter.
2. Right-click inside that folder -> New -> Shortcut.
3. Browse to 'C:\QuantumTrading\auto_start.bat'.
4. Next -> Finish.

Now the system will restart automatically if the server reboots!

=== HOW IT WORKS ===
- 'live_trainer.py' runs every hour, downloads new data, trains 'model.pkl'.
- 'file_bridge.py' watches MT4 requests, loads 'model.pkl' (hot-reload), and predicts.
- Learning is saved to disk continuously.

=== SIGNAL INTERPRETATION (FIXED) ===
The model now correctly outputs:
- signal: 1 (BUY), -1 (SELL), or 0 (NO TRADE)
- confidence: 0.5 to 1.0 (probability of the predicted direction)

Lot sizing formula: confidence / 10.0
- 55% confidence → 0.055 lots
- 70% confidence → 0.07 lots
- 90% confidence → 0.09 lots (max)

Good Luck! 🚀
