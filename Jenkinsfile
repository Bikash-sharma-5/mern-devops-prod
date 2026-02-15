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

                    sh """
                    docker build \
                      --no-cache \
                      --build-arg REACT_APP_API_URL=${BACKEND_URL} \
                      -t ${FRONTEND_IMAGE} ./frontend
                    """

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
            agent {
                docker {
                    image 'alpine/helm:3.12.3'  // Docker image with Helm preinstalled
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
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
                    kubectl create namespace monitoring || true

                    # Add Helm repo and update
                    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
                    helm repo update

                    # Install Prometheus stack
                    helm upgrade --install prometheus prometheus-community/prometheus \
                        --namespace monitoring \
                        --set alertmanager.persistentVolume.storageClass="gp2" \
                        --set server.persistentVolume.storageClass="gp2" \
                        --set server.service.type=LoadBalancer

                    # Install Grafana (optional, included in Prometheus chart usually)
                    helm upgrade --install grafana prometheus-community/grafana \
                        --namespace monitoring \
                        --set adminPassword='admin' \
                        --set service.type=LoadBalancer
                    """
                }
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
