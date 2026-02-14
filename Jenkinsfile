pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "sharmajikechhotebete"
        APP_NAME       = "mern-app"
        AWS_REGION     = "us-east-1"
        CLUSTER_NAME   = "mern-devops-cluster"

        BACKEND_IMAGE  = "${DOCKERHUB_USER}/${APP_NAME}-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/${APP_NAME}-frontend:${BUILD_NUMBER}"

        BACKEND_URL = "http://a35de4649e77d4657be95b923d8dfe83-311472493.us-east-1.elb.amazonaws.com:5000"
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
                      --build-arg REACT_APP_API_URL=${BACKEND_URL} \
                      -t ${FRONTEND_IMAGE} ./frontend
                    """

                    sh """
                    docker build \
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
                    sh '''
                    echo "$PASS" | docker login -u "$USER" --password-stdin
                    '''
                }

                retry(3) {
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
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

            # 🔥 THIS IS THE REAL FIX
            kubectl set image deployment/backend backend=${BACKEND_IMAGE}
            kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}

            kubectl rollout status deployment/backend
            kubectl rollout status deployment/frontend
            """
        }
    }
}

    }

    post {
        always {
            echo "Cleaning local Docker images..."
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
