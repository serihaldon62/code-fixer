@echo off
TITLE Quantum Forex Auto-Start (FIXED)

echo ===================================================
echo     QUANTUM FOREX TRADING SYSTEM - AUTO START
echo     FIXED VERSION
echo ===================================================

:: Ensure we are in the script's directory (works on ANY machine)
cd /d "%~dp0"

echo.
echo [1/2] Starting Trading Engine (Bridge)...
start "Quantum Bridge" /MIN cmd /k "python file_bridge.py"

TIMEOUT /T 5

echo [2/2] Starting Continuous Learning (Trainer)...
start "Quantum Trainer" /MIN cmd /k "python live_trainer.py --symbol EURUSD=X --epochs 20 --interval 3600"

echo.
echo ===================================================
echo SYSTEM IS RUNNING.
echo.
echo FIXES APPLIED:
echo - predict_proba now correctly handled
echo - StopLoss default = 500 points (50 pips)
echo - Feature dimension consistency ensured
echo ===================================================
TIMEOUT /T 10
exit
