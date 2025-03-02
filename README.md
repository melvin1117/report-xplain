# Report Xplain

Report Xplain is a web-based portal that transforms complex medical lab reports into plain-language insights, empowering patients to understand and manage their health. The application converts technical data into user-friendly dashboards with interactive visualizations and actionable recommendations.

This project was submitted as part of [HenHacks](https://www.henhackshackathon.com/) 2025 hackathon organized by **University of Delaware** powered by [MLH](https://mlh.io/).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Contribution Guidelines](#contribution-guidelines)
- [Team](#team)

## Overview

Many patients find medical reports intimidating due to technical jargon. Report Xplain bridges this gap by converting these reports into understandable, interactive insights. Whether it’s identifying key health metrics or offering personalized lifestyle suggestions, Report Xplain aims to make health information accessible to everyone.

## Features

- **User Dashboard:** Displays technical and plain-language interpretations of lab reports.
- **Report Upload:** Upload PDF reports and receive processed, easy-to-understand summaries.
- **Interactive Visualizations:** Graphs and charts for a quick overview of key health metrics.
- **Actionable Insights:** Recommendations for dietary and lifestyle improvements.
- **Secure & Compliant:** Built with data security and privacy in mind.

## Tech Stack

- **Frontend:** Angular 19
- **Backend:** NestJS with TypeORM
- **Database:** PostgreSQL
- **File Storage:** MinIO (S3-compatible)
- **Containerization:** Docker & Docker Compose

## Installation & Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/melvin1117/report-xplain.git
cd report-xplain
```


### Project Structure

- **backend:** Contains the NestJS API with MinIO for management uploads (simulates S3 in local).
- **frontend:** Contains the Angular application.
- **docker-compose.yml:** Defines the services (backend, frontend, PostgreSQL, Adminer, MinIO).

### Environment Variables

For local development, environment variables are hardcoded in the docker-compose file. In production, consider using a secure secrets management tool.
Currentlt `.env` files consists of:
- GOOGLE_API_KEY=XXXX
- BUCKET_NAME=report-uploads

## How to Run

### Using Docker Compose

Build and start all services with:

```bash
docker-compose up --build
```


This command will start:

- **Report Xplain Backend** on port `5000`
- **Angular Frontend** on port `80`
- **PostgreSQL** on port `5432`
- **Adminer** (PostgreSQL UI) on port `8080`
- **MinIO** on ports `9000` and `9001`

### Accessing the Application

- **Frontend (Angular):** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Adminer:** [http://localhost:8080](http://localhost:8080)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001)

### Running Backend Locally (Without Docker)

1. Navigate to the `backend` folder:
 bash
 cd backend
 
2. Install dependencies:
 bash
 npm install
 
3. Start the application in development mode:
 bash
 npm run start:dev

 ### Running Frontend Locally (Without Docker)

1. Navigate to the `frontend` folder:
 bash
 cd frontend
 
2. Install dependencies:
 bash
 npm install
 
3. Start the application in development mode:
 bash
 npm run start:dev
 

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: 
 bash
 git checkout -b feature/your-feature-name
 
3. Commit your changes: 
 bash
 git commit -m 'Add new feature'
 
4. Push to your branch: 
 bash
 git push origin feature/your-feature-name
 
5. Open a pull request and follow the guidelines outlined in the PR template.

Please adhere to the existing code style and include tests for new features.

## Team

- **Shubham Melvin Felix**
- **Shreyas Kumar**
- **Abhishek Umesh Gavali**
- **Amarnath Mammidipally**

---

\*Built with ❤ by the Report Xplain Team.
