pipeline {
    agent any

    environment {
        // Change these to your actual names
        DOCKERHUB_USER = "your_dockerhub_username" 
        APP_NAME       = "mern-app"
        AWS_REGION     = "us-east-1"
        CLUSTER_NAME   = "mern-devops-cluster"
        
        // Dynamic image tags using Jenkins Build Number
        BACKEND_IMAGE  = "${DOCKERHUB_USER}/${APP_NAME}-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/${APP_NAME}-frontend:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls code from your GitHub repo
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo "Building Backend Image..."
                    sh "docker build -t ${BACKEND_IMAGE} ./backend"
                    
                    echo "Building Frontend Image..."
                    sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                // Uses the 'docker-hub-creds' we created in the Jenkins UI
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                // Uses the 'aws-creds' we created for the IAM user
                withCredentials([aws(credentialsId: 'aws-creds', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        echo "Connecting to EKS Cluster..."
                        sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
                        
                        echo "Updating Manifests and Deploying..."
                        // We use 'sed' to inject the current build number into our YAML files
                        sh "sed -i 's|IMAGE_TAG|${BUILD_NUMBER}|g' k8s/backend.yaml"
                        sh "sed -i 's|IMAGE_TAG|${BUILD_NUMBER}|g' k8s/frontend.yaml"
                        
                        sh "kubectl apply -f k8s/"
                        
                        echo "Verifying Deployment..."
                        sh "kubectl rollout status deployment/backend"
                        sh "kubectl rollout status deployment/frontend"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up local Docker images to save space..."
            sh "docker rmi ${BACKEND_IMAGE} ${FRONTEND_IMAGE} || true"
        }
        success {
            echo "Successfully deployed Build #${BUILD_NUMBER} to AWS!"
        }
    }
}