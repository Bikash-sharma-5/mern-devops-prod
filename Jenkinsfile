pipeline {
    agent any

    environment {
        // Change these to your actual names
        DOCKERHUB_USER = "sharmajikechhotebete" 
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-auth', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

      stage('Deploy to EKS') {
    steps {
        withCredentials([aws(credentialsId: 'aws-creds', accessKeyVariable: 'AK', secretKeyVariable: 'SK')]) {
            sh """
                export AWS_ACCESS_KEY_ID=${AK}
                export AWS_SECRET_ACCESS_KEY=${SK}
                export AWS_DEFAULT_REGION=us-east-1

                # 1. Force identify check - this must show user/DEVOPS in logs
                aws sts get-caller-identity

                # 2. Update kubeconfig with the specific 'aws' authenticator
                aws eks update-kubeconfig --region us-east-1 --name mern-devops-cluster

                # 3. Update the YAMLs
                sed -i 's|sharmajikechhotebete/mern-backend:IMAGE_TAG|sharmajikechhotebete/mern-app-backend:${BUILD_NUMBER}|g' k8s/backend.yaml
                sed -i 's|sharmajikechhotebete/mern-frontend:IMAGE_TAG|sharmajikechhotebete/mern-app-frontend:${BUILD_NUMBER}|g' k8s/frontend.yaml

                # 4. Apply with the --validate=false flag
                kubectl apply -f k8s/ --validate=false
            """
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