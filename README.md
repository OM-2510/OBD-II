# 🏎️ OBD-II Real-Time Telemetry & Diagnostic Dashboard

## 📌 The Vision
Modern vehicles generate massive amounts of diagnostic and performance data, but most of it is hidden behind a glowing "Check Engine" light. This project bridges the gap between raw hardware telemetry and intuitive software design. 

By interfacing directly with a car's Engine Control Unit (ECU) via the OBD-II port, this full-stack application streams real-time data to a dynamic web interface. The ultimate goal is to evolve this dashboard into a customizable Multi Information Display integrated AI-powered mechanic, providing predictive maintenance and fuel optimization suggestions to driver.

## 🏗️ Architecture & Current State

This project is actively under development. The current architecture successfully establishes a low-latency data pipeline from the vehicle to the browser:

* **Hardware Interface (`pyOBD`):** A Python worker script interfaces with an ELM327 OBD-II adapter, polling the ECU for live PIDs (Parameter IDs) like RPM, Vehicle Speed, Coolant Temperature, and Engine Load.
* **The WebSocket Bridge (Flask):** To achieve the sub-second latency required for live gauges, the system bypasses standard HTTP requests. A Flask server wraps the hardware script and broadcasts the telemetry data over active WebSockets.
* **The Dynamic Frontend (React):** A React-based UI subscribes to the WebSocket stream, parsing the incoming JSON payloads to drive responsive, high-framerate digital gauges and data readouts.

## 🔮 Future Roadmap (The AI & Performance Era)

The foundational telemetry pipeline is just the beginning. The following features are slated for upcoming sprints:

### 1. Intelligent Diagnostics (The AI Mechanic)
* **DTC Hex-Code Translation:** Pulling raw Diagnostic Trouble Codes (DTCs) from the ECU.
* **AI Remediation:** Instead of just displaying a code (e.g., `P0171`), integrating an LLM API to explain the issue in plain English ("System Too Lean") and generate a step-by-step troubleshooting guide tailored to the specific vehicle make and model.

### 2. Machine Learning Fuel Optimization
* **Economy Prediction Engine:** Logging historical telemetry (throttle position, RPM, mass airflow, speed) to train a machine learning model.
* **Live Coaching:** Providing the driver with real-time feedback on throttle application and shift points to maximize fuel economy under current load conditions.

### 3. Performance Tuning Metrics
* **Launch Telemetry:** Automated 0-100 km/h and quarter-mile time logging based on raw wheel speed data.
* **Output Estimation:** Calculating estimated horsepower and torque figures dynamically using Mass Airflow (MAF), intake temperature, and RPM mapping.
* **Custom Alerting:** User-defined threshold warnings for critical metrics (e.g., triggering a UI flash if oil temperature or coolant exceeds safe tuning limits).

---
