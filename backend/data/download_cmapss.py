import os
import random

def generate_cmapss_train_data(filename: str, num_engines: int = 100):
    """
    Generates a synthetic C-MAPSS dataset (train_FD001.txt format)
    26 Columns: 
    1) Engine Unit Number
    2) Time (Cycles)
    3-5) Operational Settings (3 cols)
    6-26) Sensor Readings (21 cols)
    """
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        for engine_id in range(1, num_engines + 1):
            # Engine lifespan varies between 150 to 300 cycles before failure
            max_cycles = random.randint(150, 300)
            
            # Initial baseline sensor values for a healthy engine
            sensor_baselines = [random.uniform(10.0, 50.0) for _ in range(21)]
            
            for cycle in range(1, max_cycles + 1):
                # Operational settings (usually normalized or fixed ranges)
                op_1 = random.uniform(-0.005, 0.005)
                op_2 = random.uniform(0.0, 0.5)
                op_3 = 100.0
                
                # Introduce degradation as cycle approaches max_cycles
                degradation_factor = (cycle / max_cycles) ** 2
                
                sensors = []
                for i in range(21):
                    # Some sensors go up, some go down as engine degrades
                    direction = 1 if i % 2 == 0 else -1
                    noise = random.uniform(-0.5, 0.5)
                    val = sensor_baselines[i] + (direction * degradation_factor * random.uniform(2.0, 5.0)) + noise
                    sensors.append(val)
                
                # Format row exactly like C-MAPSS (space separated)
                row = [engine_id, cycle, op_1, op_2, op_3] + sensors
                row_str = " ".join(f"{v:.4f}" if isinstance(v, float) else str(v) for v in row)
                f.write(row_str + "\n")

if __name__ == "__main__":
    filepath = "data/train_FD001.txt"
    print(f"Generating synthetic C-MAPSS training data at {filepath}...")
    generate_cmapss_train_data(filepath, num_engines=100)
    print("Done! You can use this to train RUL models (LSTMs, XGBoost).")
