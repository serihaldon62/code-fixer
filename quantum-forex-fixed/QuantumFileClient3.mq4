//+------------------------------------------------------------------+
//|                                           QuantumFileClient.mq4 |
//|                        FIXED VERSION with Heartbeat             |
//+------------------------------------------------------------------+
#property copyright "Quantum Forex System"
#property link      "https://github.com"
#property version   "2.00"
#property strict

// Input Parameters
input int LookbackCandles = 50;
input double LotSize = 0.1;
input int StopLossPoints = 500;       // 50 pips for 5-digit broker
input int TakeProfitPoints = 0;
input int HeartbeatTimeoutSeconds = 120;  // Max seconds without heartbeat before pause
input bool RequireQuantumConfidence = true;  // Only trade if quantum confidence > threshold
input double MinQuantumConfidence = 0.55;    // Minimum confidence to trade

// Internal State
int lastBarTime = 0;
string reqFileName = "quantum_request.txt";
string respFileName = "quantum_response.txt";
string heartbeatFileName = "quantum_heartbeat.txt";
datetime lastHeartbeatCheck = 0;
bool bridgeAlive = false;

//+------------------------------------------------------------------+
//| Expert Initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("================================================");
   Print("QUANTUM FILE CLIENT v2.0 - INITIALIZED");
   Print("================================================");
   Print("Data Path: " + TerminalInfoString(TERMINAL_DATA_PATH) + "\\MQL4\\Files");
   Print("StopLoss: " + IntegerToString(StopLossPoints) + " points (" + 
         DoubleToString(StopLossPoints / 10.0, 1) + " pips)");
   Print("Heartbeat Timeout: " + IntegerToString(HeartbeatTimeoutSeconds) + "s");
   Print("Min Quantum Confidence: " + DoubleToString(MinQuantumConfidence, 2));
   Print("================================================");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Check if Python bridge is alive via heartbeat file              |
//+------------------------------------------------------------------+
bool CheckBridgeHeartbeat()
  {
   if(!FileIsExist(heartbeatFileName))
     {
      if(bridgeAlive)  // Was alive before
        {
         Print("⚠️ WARNING: Bridge heartbeat file not found!");
         bridgeAlive = false;
        }
      return false;
     }
   
   int handle = FileOpen(heartbeatFileName, FILE_READ|FILE_TXT|FILE_ANSI);
   if(handle == INVALID_HANDLE)
     {
      return false;
     }
   
   string content = "";
   while(!FileIsEnding(handle))
     {
      content += FileReadString(handle);
     }
   FileClose(handle);
   
   // Parse timestamp from heartbeat
   // Format: {"timestamp": "2024-01-20T14:30:00", ...}
   int tsStart = StringFind(content, "\"timestamp\":");
   if(tsStart == -1)
     {
      Print("⚠️ Invalid heartbeat format");
      return false;
     }
   
   // Extract timestamp string
   tsStart = StringFind(content, "\"", tsStart + 12) + 1;
   int tsEnd = StringFind(content, "\"", tsStart);
   string timestamp = StringSubstr(content, tsStart, tsEnd - tsStart);
   
   // Parse ISO timestamp (simplified - just check if recent)
   // We'll use file modification time instead for reliability
   // IMPORTANT: Use TimeLocal() not TimeCurrent() because file timestamps are local
   datetime fileTime = (datetime)FileGetInteger(heartbeatFileName, FILE_MODIFY_DATE, false);
   datetime now = TimeLocal();  // Use local time to match file system timestamps
   
   int ageSeconds = (int)(now - fileTime);
   
   // Sanity check: if age is negative (clock skew), treat as valid
   if(ageSeconds < 0) ageSeconds = 0;
   
   if(ageSeconds > HeartbeatTimeoutSeconds)
     {
      if(bridgeAlive)
        {
         Print("⚠️ Bridge heartbeat STALE! Last update: " + IntegerToString(ageSeconds) + "s ago");
         bridgeAlive = false;
        }
      return false;
     }
   
   if(!bridgeAlive)
     {
      Print("✓ Bridge heartbeat detected (age: " + IntegerToString(ageSeconds) + "s)");
      
      // Log model status from heartbeat
      if(StringFind(content, "\"model_loaded\": true") >= 0)
        {
         Print("✓ Quantum model is loaded");
        }
      else
        {
         Print("⚠️ Quantum model NOT loaded yet");
        }
      
      bridgeAlive = true;
     }
   
   return true;
  }

//+------------------------------------------------------------------+
//| Expert Tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   // Check for New Bar
   if(Time[0] == lastBarTime) return;
   lastBarTime = (int)Time[0];
   
   // Check bridge heartbeat every bar
   bool heartbeatOk = CheckBridgeHeartbeat();
   
   if(!heartbeatOk)
     {
      Print("⏸️ Skipping trade - Bridge not responding (check Python process)");
      return;
     }
   
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
   Print("NEW BAR - Requesting Quantum Prediction...");
   
   // 1. Prepare JSON
   string json = "{\"closes\": [";
   for(int i = LookbackCandles; i >= 1; i--)
     {
      json += DoubleToString(Close[i], 5);
      if(i > 1) json += ", ";
     }
   json += "]}";
   
   // 2. Write to File
   int file_handle = FileOpen(reqFileName, FILE_WRITE|FILE_TXT|FILE_ANSI);
   if(file_handle != INVALID_HANDLE)
     {
      FileWrite(file_handle, json);
      FileClose(file_handle);
      Print("Request written (" + IntegerToString(LookbackCandles) + " bars)");
     }
   else
     {
      Print("❌ Error writing request: " + IntegerToString(GetLastError()));
      return;
     }

   // 3. Wait for Response
   int attempts = 0;
   string response = "";
   bool received = false;
   
   while(attempts < 20) // 10 second timeout
     {
      Sleep(500);
      
      if(FileIsExist(respFileName))
        {
         int read_handle = FileOpen(respFileName, FILE_READ|FILE_TXT|FILE_ANSI);
         if(read_handle != INVALID_HANDLE)
           {
            string line = FileReadString(read_handle);
            if(StringLen(line) > 5) 
              {
               response = line;
               received = true;
               FileClose(read_handle);
               FileDelete(respFileName);
               break;
              }
            FileClose(read_handle);
           }
        }
      attempts++;
     }
     
   if(received)
     {
      Print("Quantum Response: " + response);
      ProcessQuantumSignal(response);
     }
   else
     {
      Print("❌ Timeout waiting for quantum prediction");
     }
   
   Print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

//+------------------------------------------------------------------+
//| Process Quantum Signal with validation                          |
//+------------------------------------------------------------------+
void ProcessQuantumSignal(string json)
  {
   int signal = ParseJsonInt(json, "signal");
   double confidence = ParseJsonDouble(json, "confidence");
   double p_up = ParseJsonDouble(json, "p_up");
   double p_down = ParseJsonDouble(json, "p_down");
   
   Print("┌─────────────────────────────────────┐");
   Print("│ QUANTUM PREDICTION RESULT           │");
   Print("├─────────────────────────────────────┤");
   Print("│ P(DOWN): " + DoubleToString(p_down, 4) + "                      │");
   Print("│ P(UP):   " + DoubleToString(p_up, 4) + "                      │");
   Print("│ Confidence: " + DoubleToString(confidence, 4) + " (" + DoubleToString(confidence*100, 1) + "%)         │");
   Print("│ Signal: " + SignalToString(signal) + "                         │");
   Print("└─────────────────────────────────────┘");
   
   // Validate quantum confidence
   if(RequireQuantumConfidence && confidence < MinQuantumConfidence)
     {
      Print("⏸️ Signal rejected: Confidence " + DoubleToString(confidence, 2) + 
            " below threshold " + DoubleToString(MinQuantumConfidence, 2));
      return;
     }
   
   // Dynamic lot sizing based on quantum confidence
   // Higher quantum certainty = larger position
   double dynamicLots = confidence / 10.0; 
   if(dynamicLots > 0.09) dynamicLots = 0.09;
   if(dynamicLots < 0.01) dynamicLots = 0.01;
   dynamicLots = NormalizeDouble(dynamicLots, 2);
   
   Print("Dynamic Lots: " + DoubleToString(dynamicLots, 2) + 
         " (based on " + DoubleToString(confidence*100, 1) + "% quantum confidence)");

   double sl = 0, tp = 0;
   
   if(signal == 1)  // BUY
     {
      CloseAllRequests(OP_SELL);
      if(CountOrders(OP_BUY) == 0)
        {
         if(StopLossPoints > 0) sl = Ask - StopLossPoints * Point;
         if(TakeProfitPoints > 0) tp = Ask + TakeProfitPoints * Point;
         int ticket = OrderSend(Symbol(), OP_BUY, dynamicLots, Ask, 3, sl, tp, 
                                "Quantum BUY [" + DoubleToString(confidence*100, 0) + "%]", 0, 0, Blue);
         if(ticket > 0)
            Print("✓ BUY order opened: #" + IntegerToString(ticket) + " @ " + DoubleToString(Ask, 5));
         else
            Print("❌ BUY failed: " + IntegerToString(GetLastError()));
        }
     }
   else if(signal == -1)  // SELL
     {
      CloseAllRequests(OP_BUY);
      if(CountOrders(OP_SELL) == 0)
        {
         if(StopLossPoints > 0) sl = Bid + StopLossPoints * Point;
         if(TakeProfitPoints > 0) tp = Bid - TakeProfitPoints * Point; 
         int ticket = OrderSend(Symbol(), OP_SELL, dynamicLots, Bid, 3, sl, tp, 
                                "Quantum SELL [" + DoubleToString(confidence*100, 0) + "%]", 0, 0, Red);
         if(ticket > 0)
            Print("✓ SELL order opened: #" + IntegerToString(ticket) + " @ " + DoubleToString(Bid, 5));
         else
            Print("❌ SELL failed: " + IntegerToString(GetLastError()));
        }
     }
   else  // NEUTRAL
     {
      Print("⏸️ Quantum signal NEUTRAL - no action");
     }
  }

//+------------------------------------------------------------------+
//| Helper Functions                                                 |
//+------------------------------------------------------------------+
string SignalToString(int signal)
  {
   if(signal == 1) return "BUY 📈";
   if(signal == -1) return "SELL 📉";
   return "NEUTRAL ⏸️";
  }

int ParseJsonInt(string json, string key)
  {
   int start = StringFind(json, "\"" + key + "\":");
   if(start == -1) return 0;
   start = start + StringLen(key) + 3; 
   int end = StringFind(json, ",", start);
   if(end == -1) end = StringFind(json, "}", start);
   string val = StringSubstr(json, start, end - start);
   return (int)StringToInteger(val);
  }

double ParseJsonDouble(string json, string key)
  {
   int start = StringFind(json, "\"" + key + "\":");
   if(start == -1) return 0.0;
   start = start + StringLen(key) + 3;
   int end = StringFind(json, ",", start);
   if(end == -1) end = StringFind(json, "}", start);
   string val = StringSubstr(json, start, end - start);
   return StringToDouble(val);
  }

void CloseAllRequests(int type)
  {
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
        {
         if(OrderSymbol() == Symbol() && OrderType() == type)
           {
            bool res = false;
            double price = (type == OP_BUY) ? Bid : Ask;
            res = OrderClose(OrderTicket(), OrderLots(), price, 3, CLR_NONE);
            if(res) Print("✓ Closed " + (type == OP_BUY ? "BUY" : "SELL") + " #" + IntegerToString(OrderTicket()));
           }
        }
     }
  }

int CountOrders(int type)
  {
   int count = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
        {
         if(OrderSymbol() == Symbol() && OrderType() == type) count++;
        }
     }
   return count;
  }
