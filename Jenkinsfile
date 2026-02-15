pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "sharmajikechhotebete"
        APP_NAME       = "mern-app"
        AWS_REGION     = "us-east-1"
        CLUSTER_NAME   = "mern-devops-cluster"

        BACKEND_IMAGE  = "${DOCKERHUB_USER}/${APP_NAME}-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/${APP_NAME}-frontend:${BUILD_NUMBER}"

        BACKEND_URL = "http://aa3631b76df4444a49ed5a415694e17a-801271181.us-east-1.elb.amazonaws.com"
        MONITORING_NAMESPACE = "monitoring"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building images with API URL: ${BACKEND_URL}"

                    // Frontend build
                    sh """
                    docker build \
                      --no-cache \
                      --build-arg REACT_APP_API_URL=${BACKEND_URL} \
                      -t ${FRONTEND_IMAGE} ./frontend
                    """

                    // Backend build (with metrics)
                    sh """
                    docker build \
                      --no-cache \
                      -t ${BACKEND_IMAGE} ./backend
                    """
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-auth',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
                }

                sh "docker push ${BACKEND_IMAGE}"
                sh "docker push ${FRONTEND_IMAGE}"
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                withCredentials([aws(
                    credentialsId: 'aws-creds',
                    accessKeyVariable: 'AK',
                    secretKeyVariable: 'SK'
                )]) {
                    sh """
                    export AWS_ACCESS_KEY_ID=${AK}
                    export AWS_SECRET_ACCESS_KEY=${SK}
                    export AWS_DEFAULT_REGION=${AWS_REGION}

                    aws eks update-kubeconfig \
                      --region ${AWS_REGION} \
                      --name ${CLUSTER_NAME}

                    kubectl apply -f k8s/

                    kubectl set image deployment/backend backend=${BACKEND_IMAGE}
                    kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}

                    kubectl rollout restart deployment/backend
                    kubectl rollout restart deployment/frontend

                    kubectl rollout status deployment/backend
                    kubectl rollout status deployment/frontend
                    """
                }
            }
        }

        stage('Deploy Monitoring Stack') {
            steps {
                withCredentials([aws(
                    credentialsId: 'aws-creds',
                    accessKeyVariable: 'AK',
                    secretKeyVariable: 'SK'
                )]) {
                    sh """
                    export AWS_ACCESS_KEY_ID=${AK}
                    export AWS_SECRET_ACCESS_KEY=${SK}
                    export AWS_DEFAULT_REGION=${AWS_REGION}

                    aws eks update-kubeconfig \
                      --region ${AWS_REGION} \
                      --name ${CLUSTER_NAME}

                    # Create monitoring namespace
                    kubectl create namespace ${MONITORING_NAMESPACE} || true

                    # Add Helm repos
                    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
                    helm repo add grafana https://grafana.github.io/helm-charts
                    helm repo update

                    # Deploy Prometheus
                    helm upgrade --install prometheus prometheus-community/prometheus \
                        --namespace ${MONITORING_NAMESPACE} \
                        --set server.persistentVolume.enabled=false

                    # Deploy Grafana
                    helm upgrade --install grafana grafana/grafana \
                        --namespace ${MONITORING_NAMESPACE} \
                        --set persistence.enabled=false \
                        --set adminPassword=admin

                    # Optional: port-forward to test dashboards locally
                    # kubectl port-forward svc/grafana 3000:80 -n ${MONITORING_NAMESPACE} &
                    """
                }
            }
        }

        stage('Configure Prometheus Scrape for Backend') {
            steps {
                sh """
                # Create ConfigMap for Prometheus to scrape backend metrics
                cat <<EOF | kubectl apply -n ${MONITORING_NAMESPACE} -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-scrape-backend
data:
  prometheus.yml: |
    scrape_configs:
      - job_name: 'backend'
        static_configs:
          - targets: ['backend-service:5000']
EOF
                """
            }
        }
    }

    post {
        always {
            sh "docker rmi ${BACKEND_IMAGE} ${FRONTEND_IMAGE} || true"
        }

        success {
            echo "Build #${BUILD_NUMBER} deployed successfully 🚀"
        }

        failure {
            echo "Pipeline failed ❌"
        }
    }
}
