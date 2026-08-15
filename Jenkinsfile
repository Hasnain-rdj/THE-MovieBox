pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from SCM...'
                checkout scm
            }
        }

        stage('Build & Test Auth Service') {
            steps {
                echo 'Building and Testing Auth Service...'
                dir('auth-service') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }

        stage('Build & Test Movie Service') {
            steps {
                echo 'Building and Testing Movie Service...'
                dir('movie-service') {
                    sh 'npm install'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building Next.js Frontend Application...'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed! Please check stage logs.'
        }
    }
}
