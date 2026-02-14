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
            def backendUrl = "http://a35de4649e77d4657be95b923d8dfe83-311472493.us-east-1.elb.amazonaws.com:5000"
            
            echo "FORCE BUILDING FRONTEND: ${backendUrl}"
            // --no-cache is MANDATORY here to break the cycle
            sh "docker build --no-cache --build-arg REACT_APP_API_URL=${backendUrl} -t sharmajikechhotebete/mern-app-frontend:${BUILD_NUMBER} ./frontend"
            
            sh "docker build -t sharmajikechhotebete/mern-app-backend:${BUILD_NUMBER} ./backend"
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
        withCredentials([aws(accessKeyVariable: 'AK', credentialsId: 'aws-creds', secretKeyVariable: 'SK')]) {
            sh """
                export AWS_ACCESS_KEY_ID=${AK}
                export AWS_SECRET_ACCESS_KEY=${SK}
                export AWS_DEFAULT_REGION=us-east-1
                aws eks update-kubeconfig --region us-east-1 --name mern-devops-cluster
                
                # Apply the changes
                kubectl apply -f k8s/ --validate=false
                
                # FORCE KUBERNETES TO PULL THE NEW IMAGE VERSION
                kubectl rollout restart deployment/frontend
                kubectl rollout status deployment/frontend
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