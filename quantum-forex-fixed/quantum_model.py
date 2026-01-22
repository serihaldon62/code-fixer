import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_machine_learning.neural_networks import EstimatorQNN
from qiskit_machine_learning.algorithms.classifiers import NeuralNetworkClassifier
from qiskit.quantum_info import SparsePauliOp
from qiskit_algorithms.optimizers import COBYLA
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes


class QuantumModel:
    """
    Quantum Neural Network Classifier for Forex prediction.
    
    FIX #4: Removed unused num_features parameter.
    The feature_dimension is always equal to num_qubits in ZZFeatureMap.
    If you need more features than qubits, you must either:
    - Increase num_qubits, or
    - Use dimensionality reduction on input features
    """
    
    def __init__(self, num_qubits=4, maxiter=100):
        """
        Initialize Quantum Model.
        
        Args:
            num_qubits: Number of qubits (also determines input feature dimension)
            maxiter: Maximum optimizer iterations per training session
        """
        self.num_qubits = num_qubits
        self.feature_map = self._create_feature_map(num_qubits)
        self.ansatz = self._create_ansatz(num_qubits)
        
        # Build full circuit
        self.qc = QuantumCircuit(num_qubits)
        self.qc.compose(self.feature_map, inplace=True)
        self.qc.compose(self.ansatz, inplace=True)
        
        # Observable: Z measurement on the first qubit
        obs_string = "I" * (num_qubits - 1) + "Z"
        observable = SparsePauliOp.from_list([(obs_string, 1)])

        self.qnn = EstimatorQNN(
            circuit=self.qc,
            input_params=self.feature_map.parameters,
            weight_params=self.ansatz.parameters,
            observables=observable
        )
        
        self.iteration = 0
        self.loss_history = []
        
        self.classifier = NeuralNetworkClassifier(
            self.qnn, 
            optimizer=COBYLA(maxiter=maxiter),
            loss='squared_error',
            callback=self._callback_graph,
            warm_start=True  # Essential for continuous training!
        )

    def _create_feature_map(self, num_qubits):
        """
        Create feature map for data encoding.
        
        FIX: feature_dimension = num_qubits (they must match).
        If you need 16 features, you need 16 qubits (not practical).
        Instead, use 4 features (T-0) consistently across all code.
        """
        return ZZFeatureMap(
            feature_dimension=num_qubits,
            reps=1,
            entanglement='linear'
        )

    def _create_ansatz(self, num_qubits):
        """Create trainable ansatz (variational form)."""
        return RealAmplitudes(
            num_qubits=num_qubits,
            reps=2,
            entanglement='linear'
        )

    def _callback_graph(self, weights, obj_func_eval):
        """Training callback for progress logging."""
        self.iteration += 1
        self.loss_history.append(obj_func_eval)
        print(f"Iteration {self.iteration} - Loss: {obj_func_eval:.4f}")

    def train(self, X, y):
        """
        Train the quantum classifier.
        
        Args:
            X: Feature array, shape (n_samples, num_qubits)
            y: Target array, shape (n_samples,), values 0 or 1
        """
        print(f"Training Quantum Model on {len(X)} samples...")
        print(f"Input shape: {X.shape}, Expected features: {self.num_qubits}")
        
        if X.shape[1] != self.num_qubits:
            raise ValueError(
                f"Feature dimension mismatch! Got {X.shape[1]} features, "
                f"expected {self.num_qubits}. Ensure data preparation matches model."
            )
        
        self.iteration = 0
        self.loss_history = []
        self.classifier.fit(X, y)
        print("Training Complete.")

    def predict(self, X):
        """Predict class labels."""
        return self.classifier.predict(X)
        
    def predict_proba(self, X):
        """
        Predict class probabilities.
        
        Returns:
            Array of shape (n_samples, 2) with [P(down), P(up)] for each sample.
            Values are in range [0, 1].
        """
        return self.classifier.predict_proba(X)
        
    def save(self, file_path):
        """Save trained classifier to file."""
        import pickle
        with open(file_path, 'wb') as f:
            pickle.dump(self.classifier, f)
        print(f"Model saved to {file_path}")

    def load(self, file_path):
        """Load trained classifier from file."""
        import pickle
        with open(file_path, 'rb') as f:
            self.classifier = pickle.load(f)
        print(f"Model loaded from {file_path}")
