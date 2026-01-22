import numpy as np
import logging
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit_machine_learning.neural_networks import EstimatorQNN
from qiskit_machine_learning.algorithms.classifiers import NeuralNetworkClassifier
from qiskit.quantum_info import SparsePauliOp
from qiskit_algorithms.optimizers import COBYLA
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes

log = logging.getLogger('quantum_model')


class QuantumModel:
    """
    Quantum Neural Network Classifier for Forex prediction.
    
    This model uses a real quantum circuit (simulated) with:
    - ZZFeatureMap: Encodes classical features into quantum states using
      entanglement and rotation gates. The ZZ refers to the two-qubit 
      entangling gates that create quantum correlations.
    - RealAmplitudes ansatz: Trainable parameterized circuit with 
      rotation gates (Ry, Rz) and CNOT entanglement.
    - Z-observable: Measures expectation value of Pauli-Z on first qubit.
    
    The quantum advantage comes from:
    1. Exponential feature space: n qubits can represent 2^n basis states
    2. Entanglement: Captures complex correlations classical NNs might miss
    3. Interference: Quantum amplitudes can interfere constructively/destructively
    """
    
    def __init__(self, num_qubits=4, maxiter=100):
        """
        Initialize Quantum Model.
        
        Args:
            num_qubits: Number of qubits (= input feature dimension)
            maxiter: Maximum optimizer iterations per training session
        """
        self.num_qubits = num_qubits
        
        log.info(f"Initializing Quantum Model with {num_qubits} qubits")
        
        # Feature map: encodes classical data into quantum state
        self.feature_map = self._create_feature_map(num_qubits)
        log.info(f"  Feature Map: ZZFeatureMap (depth={self.feature_map.reps})")
        log.info(f"    - Creates superposition and entanglement from input data")
        log.info(f"    - {len(self.feature_map.parameters)} input parameters")
        
        # Ansatz: trainable variational circuit
        self.ansatz = self._create_ansatz(num_qubits)
        log.info(f"  Ansatz: RealAmplitudes (reps={self.ansatz.reps})")
        log.info(f"    - {len(self.ansatz.parameters)} trainable weights")
        
        # Build full circuit
        self.qc = QuantumCircuit(num_qubits)
        self.qc.compose(self.feature_map, inplace=True)
        self.qc.compose(self.ansatz, inplace=True)
        
        log.info(f"  Total circuit depth: {self.qc.depth()}")
        log.info(f"  Total gates: {len(self.qc.data)}")
        
        # Observable: Z measurement on first qubit
        obs_string = "I" * (num_qubits - 1) + "Z"
        observable = SparsePauliOp.from_list([(obs_string, 1)])
        log.info(f"  Observable: {obs_string} (Z on qubit 0)")

        # Create Quantum Neural Network
        self.qnn = EstimatorQNN(
            circuit=self.qc,
            input_params=self.feature_map.parameters,
            weight_params=self.ansatz.parameters,
            observables=observable
        )
        
        self.iteration = 0
        self.loss_history = []
        
        # Classifier wrapper
        self.classifier = NeuralNetworkClassifier(
            self.qnn, 
            optimizer=COBYLA(maxiter=maxiter),
            loss='squared_error',
            callback=self._callback_graph,
            warm_start=True
        )
        
        log.info("✓ Quantum Model initialized")

    def _create_feature_map(self, num_qubits):
        """
        Create ZZFeatureMap for data encoding.
        
        The ZZFeatureMap applies:
        1. Hadamard gates: Create superposition
        2. RZ rotations: Encode each feature
        3. ZZ interactions: Create entanglement between qubits
        
        This maps classical data to a high-dimensional Hilbert space.
        """
        return ZZFeatureMap(
            feature_dimension=num_qubits,
            reps=1,
            entanglement='linear'
        )

    def _create_ansatz(self, num_qubits):
        """
        Create RealAmplitudes ansatz (variational form).
        
        Contains trainable Ry rotation gates and CNOT entanglement.
        These parameters are optimized during training.
        """
        return RealAmplitudes(
            num_qubits=num_qubits,
            reps=2,
            entanglement='linear'
        )

    def _callback_graph(self, weights, obj_func_eval):
        """Training callback for progress logging."""
        self.iteration += 1
        self.loss_history.append(obj_func_eval)
        if self.iteration % 5 == 0 or self.iteration == 1:
            log.info(f"  Iteration {self.iteration}: Loss = {obj_func_eval:.6f}")

    def train(self, X, y):
        """
        Train the quantum classifier.
        
        The training process:
        1. For each sample, encode features into quantum circuit
        2. Run circuit (or simulation) to get expectation value
        3. Compare with target, compute loss
        4. COBYLA optimizer adjusts ansatz parameters
        5. Repeat until convergence or max iterations
        """
        log.info(f"Training Quantum Model on {len(X)} samples...")
        log.info(f"Input shape: {X.shape}")
        
        if X.shape[1] != self.num_qubits:
            raise ValueError(
                f"Feature dimension mismatch! Got {X.shape[1]}, expected {self.num_qubits}"
            )
        
        self.iteration = 0
        self.loss_history = []
        
        log.info("Starting quantum optimization loop...")
        self.classifier.fit(X, y)
        
        final_loss = self.loss_history[-1] if self.loss_history else 0
        log.info(f"✓ Training complete. Final loss: {final_loss:.6f}")

    def predict(self, X):
        """Predict class labels (0 or 1)."""
        return self.classifier.predict(X)
        
    def predict_proba(self, X):
        """
        Predict class probabilities.
        
        Returns [P(down), P(up)] for each sample.
        These come from quantum measurement statistics.
        """
        return self.classifier.predict_proba(X)
    
    def get_circuit_diagram(self):
        """Return text representation of quantum circuit."""
        return self.qc.draw(output='text')
        
    def save(self, file_path):
        """Save trained classifier to file."""
        import pickle
        with open(file_path, 'wb') as f:
            pickle.dump(self.classifier, f)
        log.info(f"Model saved to {file_path}")

    def load(self, file_path):
        """Load trained classifier from file."""
        import pickle
        with open(file_path, 'rb') as f:
            self.classifier = pickle.load(f)
        log.info(f"Model loaded from {file_path}")
