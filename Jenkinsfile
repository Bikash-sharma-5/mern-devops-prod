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
        withCredentials([aws(credentialsId: 'aws-creds', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
            script {
                // This ensures the environment variables are active for the shell
                sh """
                    export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
                    export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
                    export AWS_DEFAULT_REGION=us-east-1

                    echo "Connecting to EKS Cluster..."
                    aws eks update-kubeconfig --region us-east-1 --name mern-devops-cluster

                    echo "Updating Manifests..."
                    sed -i 's|sharmajikechhotebete/mern-backend:IMAGE_TAG|sharmajikechhotebete/mern-app-backend:${BUILD_NUMBER}|g' k8s/backend.yaml
                    sed -i 's|sharmajikechhotebete/mern-frontend:IMAGE_TAG|sharmajikechhotebete/mern-app-frontend:${BUILD_NUMBER}|g' k8s/frontend.yaml

                    echo "Applying to Cluster..."
                    kubectl apply -f k8s/ --validate=false
                """
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