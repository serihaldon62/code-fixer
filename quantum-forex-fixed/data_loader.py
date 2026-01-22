import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler


class ForexDataLoader:
    """
    Forex data loader for quantum model training.
    
    FIX #2: Clarified feature dimension handling.
    This loader now consistently produces 4 features per sample (T-0 only),
    matching what file_bridge.py and live_trainer.py expect.
    """
    
    def __init__(self, symbol='EURUSD=X', interval='1h', period='1mo'):
        self.symbol = symbol
        self.interval = interval
        self.period = period
        self.data = None
        self.scaler = MinMaxScaler(feature_range=(0, 2 * np.pi))

    def fetch_data(self):
        """Fetch forex data from Yahoo Finance with local cache fallback."""
        filename = f"{self.symbol}_{self.period}_{self.interval}.csv"
        try:
            print(f"Fetching data for {self.symbol}...")
            self.data = yf.download(self.symbol, interval=self.interval, period=self.period)
            
            if self.data.empty:
                raise ValueError("Empty data downloaded")
                
            # Handle MultiIndex columns
            if isinstance(self.data.columns, pd.MultiIndex):
                self.data = self.data.xs(self.symbol, level=1, axis=1)
            
            self.data.dropna(inplace=True)
            self.data.to_csv(filename)
            print(f"Fetched {len(self.data)} data points and saved to {filename}.")
            
        except Exception as e:
            print(f"Download failed: {e}. Trying to load local cache: {filename}")
            try:
                self.data = pd.read_csv(filename, index_col=0, parse_dates=True)
                print(f"Loaded {len(self.data)} data points from cache.")
            except FileNotFoundError:
                raise ValueError(f"No local data found for {filename} and download failed.")
        
        return self.data

    def prepare_features(self, lookback=4):
        """
        Prepare features for quantum circuit training.
        
        Args:
            lookback: Number of historical bars for indicator calculation 
                      (NOT used for sequence flattening anymore)
        
        Returns:
            X: Features array, shape (n_samples, 4) - [Close, Returns, RSI, MACD]
            y: Target array, shape (n_samples,) - 1 if price up, 0 if down
            
        FIX: Now returns 4 features per sample (T-0 only), NOT flattened lookback.
        This matches file_bridge.py which uses only current bar features.
        The old code created 16 features (4 * lookback) but live_trainer.py 
        then sliced to last 4 anyway, which was confusing and wasteful.
        """
        if self.data is None:
            self.fetch_data()
            
        df = self.data.copy()
        
        # Technical Indicators
        df['Returns'] = df['Close'].pct_change()
        
        # RSI (14-period)
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
        
        # Target: 1 if Next Close > Current Close (Price Up), else 0
        df['Target'] = np.where(df['Close'].shift(-1) > df['Close'], 1, 0)
        
        # Drop the last row as it has no target
        df = df.iloc[:-1]

        # Select features - 4 features per sample
        feature_cols = ['Close', 'Returns', 'RSI', 'MACD']
        
        # Scale features to [0, 2*pi] for rotation encoding
        data_values = df[feature_cols].values
        self.scaler = MinMaxScaler(feature_range=(0, 2 * np.pi))
        scaled_data = self.scaler.fit_transform(data_values)
        
        # Get targets
        y = df['Target'].values
        
        # Skip first 'lookback' samples to ensure indicator stability
        X = scaled_data[lookback:]
        y = y[lookback:]
        
        print(f"Prepared {len(X)} samples with {X.shape[1]} features each")
            
        return X, y


if __name__ == "__main__":
    loader = ForexDataLoader()
    X, y = loader.prepare_features()
    print(f"Features shape: {X.shape}, Target shape: {y.shape}")
    print(f"Sample X[0]: {X[0]}")
    print(f"Sample y[0]: {y[0]}")
