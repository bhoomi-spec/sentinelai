# Aegis One

## AI-Powered Network Intrusion Detection & Security Monitoring Platform

Aegis One is a full-stack cybersecurity platform that provides real-time network monitoring, intelligent threat detection, packet analysis, system health monitoring, and security analytics. It combines Artificial Intelligence, Machine Learning, Networking, and Full-Stack Development to deliver an interactive security monitoring solution designed for small and medium-sized organizations.

The application captures live network traffic, analyzes packets in real time, identifies suspicious behavior using rule-based detection and machine learning models, and presents actionable insights through a modern web dashboard.

---

live demo - https://aegisone.onrender.com/

## Overview

Traditional enterprise security monitoring solutions are often expensive and complex. Aegis One aims to provide an affordable, intelligent, and user-friendly alternative capable of monitoring network activity, detecting threats, and assisting users in understanding their network security posture through explainable AI.

Unlike many demonstration projects, Aegis One is designed to work with real system information and live network traffic. Dashboards begin empty and populate dynamically as the application captures and processes actual data.

---

## Features

- Real-Time Network Packet Capture
- AI-Based Anomaly Detection
- Rule-Based Threat Detection
- Live Security Dashboard
- Packet Inspection & Search
- Incident Management
- Network Traffic Analytics
- System Health Monitoring
- Explainable AI Predictions
- Security Report Generation
- Role-Based Authentication
- Real-Time Notifications
- Responsive Enterprise Dashboard
- Optional Demo Mode for Presentations

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Chart.js
- Recharts
- TanStack Query
- Socket.IO
- Framer Motion

### Backend

- FastAPI
- Python
- SQLAlchemy
- Alembic
- JWT Authentication
- Redis
- Celery
- WebSockets

### Machine Learning

- Scikit-learn
- XGBoost
- Random Forest
- Isolation Forest
- Autoencoder
- Pandas
- NumPy

### Database

- PostgreSQL
- Redis

### DevOps

- Docker
- Docker Compose
- NGINX
- GitHub Actions

---

## Key Capabilities

- Capture and analyze live network traffic
- Monitor CPU, memory, disk, and network usage
- Detect suspicious behavior using AI and machine learning
- Classify security events with confidence scores
- Generate explainable threat analysis
- Store and visualize historical security events
- Export security reports in multiple formats
- Display only real captured data during live monitoring

---

## Project Structure

```text
Aegis-One/
│
├── frontend/
├── backend/
├── ml/
├── packet_capture/
├── database/
├── docker/
├── nginx/
├── docs/
├── tests/
├── scripts/
├── .github/
├── docker-compose.yml
├── README.md
└── .env.example
```

---

## Core Modules

- Authentication
- Dashboard
- Live Monitoring
- Packet Analyzer
- Threat Detection
- Incident Management
- Analytics
- Reports
- System Health
- Machine Learning
- Settings

---

## Security Features

- JWT Authentication
- Role-Based Access Control
- Password Hashing
- Secure API Endpoints
- Input Validation
- Audit Logging
- Rate Limiting
- Environment Variable Management

---

## Machine Learning Workflow

- Data Collection
- Data Preprocessing
- Feature Engineering
- Model Training
- Model Evaluation
- Threat Prediction
- Explainable AI
- Confidence Scoring

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/bhoomi-spec/Aegis-One.git
cd Aegis-One
```

Configure the required environment variables:

```bash
cp .env.example .env
```

Start the application:

```bash
docker compose up --build
```

---

## Future Enhancements

- Email and SMS Alerts
- Multi-Device Network Monitoring
- Threat Intelligence Integration
- SIEM Integration
- Cloud Deployment
- Mobile Companion Application
- AI Security Assistant
- Multi-Tenant Support

---

## Author

**Bhoomika Kotresh**

---

## License

This project is intended for educational, research, and demonstration purposes.
