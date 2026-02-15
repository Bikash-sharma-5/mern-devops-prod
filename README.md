# 🚀 MERN DevOps Cloud-Native Project

[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) 
[![Node.js](https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) 
[![React](https://img.shields.io/badge/React-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/) 
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/) 
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/) 
[![AWS](https://img.shields.io/badge/AWS-232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/) 
[![Jenkins](https://img.shields.io/badge/Jenkins-D24939.svg?style=for-the-badge&logo=jenkins&logoColor=white)](https://www.jenkins.io/)


## 📝 Project Overview

Cloud-native **MERN stack app** deployed on **AWS EKS** using **Docker** and **Kubernetes**, automated with **Jenkins CI/CD**.

- **Frontend:** React  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (Persistent Volume in Kubernetes)  
- **CI/CD:** Jenkins builds Docker images, pushes to Docker Hub, deploys to Kubernetes  
- **Cloud:** AWS EKS

---

## 🏗 Architecture

                  ┌─────────────┐
                │   Browser   │
                └─────┬───────┘
                      │ HTTP/HTTPS (port 80/443)
                      ▼
              ┌───────────────┐
              │ Frontend SVC  │  (Kubernetes Service)
              │ ClusterIP or  │  Exposes port 80
              │ LoadBalancer  │
              └─────┬─────────┘
                    │
            ┌───────▼───────────┐
            │ Frontend Pod(s)   │  (Deployment)
            │ ┌───────────────┐ │
            │ │ Nginx         │ │
            │ │ Container     │ │
            │ │ Port: 80      │ │
            │ └───────────────┘ │
            │ React static files│
            └───────┬───────────┘
                    │ REST API calls (port 5000)
                    ▼
              ┌───────────────┐
              │ Backend SVC   │  (Kubernetes Service)
              │ ClusterIP      │  Exposes port 5000
              └─────┬─────────┘
                    │
          ┌─────────▼─────────┐
          │ Backend Pod(s)    │  (Deployment)
          │ ┌───────────────┐ │
          │ │ Node.js +     │ │
          │ │ Express       │ │
          │ │ Container     │ │
          │ │ Port: 5000    │ │
          │ └───────────────┘ │
          │ Handles API logic │
          └───────┬───────────┘
                  │ MongoDB connection (port 27017)
                  ▼
          ┌───────────────┐
          │ MongoDB SVC   │  (Kubernetes Service)
          │ ClusterIP     │  Exposes port 27017
          └─────┬─────────┘
                │
          ┌─────▼─────────┐
          │ MongoDB Pod(s)│  (StatefulSet)
          │ ┌───────────┐ │
          │ │ MongoDB    │ │
          │ │ Container  │ │
          │ │ Port:27017 │ │
          │ └───────────┘ │
          │ Persistent    │
          │ Volume Claim  │
          └───────────────┘


---


### Deployment Flow:

1. **Developers push code** to GitHub.
2. **Jenkins Pipeline** triggers:
   - Builds Docker images for frontend and backend
   - Pushes images to Docker Hub
   - Applies Kubernetes manifests to update deployments in AWS EKS
3. **Kubernetes manages** pods, services, and persistent storage for MongoDB.
4. **Browser requests** hit frontend, which communicates with backend via REST API.

---

## ⚡ Features in Detail

- **Full MERN Stack:** Complete modern web application with React frontend, Node.js backend, and MongoDB database.
- **Containerized Applications:** Docker ensures consistent runtime environment across all stages (dev, test, prod).
- **Kubernetes Deployment:**
  - Frontend, backend, and database deployed as separate pods
  - Services for internal communication
  - Persistent volumes for database storage
- **AWS EKS Integration:** Highly available and scalable Kubernetes cluster.
- **CI/CD Automation:** Jenkins handles automated building, testing, and deployment.
- **Environment Management:** Secrets and configurations handled securely with Kubernetes secrets and ConfigMaps.

---

## 🛠 Technologies & Tools

| Layer             | Technology / Tool                     | Purpose |
|------------------|--------------------------------------|---------|
| Frontend          | React, npm                            | UI & client-side logic |
| Backend           | Node.js, Express, npm                 | REST API and business logic |
| Database          | MongoDB                               | NoSQL database |
| Containerization  | Docker                                | Packaging applications |
| Orchestration     | Kubernetes (EKS)                      | Deploy, scale, and manage containers |
| CI/CD             | Jenkins                               | Automate build, push, deploy |
| Cloud Platform    | AWS (EKS, IAM, Secrets)               | Scalable and secure hosting |
| Monitoring        | Prometheus/Grafana (optional)         | Metrics & alerting |
| Deployment Scripts| kubectl, Helm (optional)              | Deploy and manage Kubernetes objects |

---


