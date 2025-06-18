pipeline {
  agent any

  environment {
    AWS_REGION = 'us-east-1'
    ECR_BACKEND = '176381609267.dkr.ecr.us-east-1.amazonaws.com/backend'
    ECR_FRONTEND = '176381609267.dkr.ecr.us-east-1.amazonaws.com/frontend'
    SONAR_TOKEN = credentials('sonarqube-token')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

stage('SonarQube Analysis') {
  steps {
    withSonarQubeEnv('SonarQube') {
      sh '/opt/sonar-scanner/bin/sonar-scanner -Dsonar.projectKey=nti-app -Dsonar.sources=. -Dsonar.host.url=http://13.220.161.33:9000 -Dsonar.login=$SONAR_TOKEN'
    }
  }
}

    stage('Wait for Quality Gate') {
      steps {
        timeout(time: 1, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    stage('Build & Scan Backend Image') {
      steps {
        dir('backend') {
          script {
            def image = "${env.ECR_BACKEND}:latest"
            sh """
              docker build -t ${image} .
              trivy image --exit-code 1 --severity HIGH,CRITICAL ${image}
              aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 176381609267.dkr.ecr.us-east-1.amazonaws.com
              docker push ${image}
            """
          }
        }
      }
    }

    stage('Build & Scan Frontend Image') {
      steps {
        dir('frontend') {
          script {
            def image = "${env.ECR_FRONTEND}:latest"
            sh """
              docker build -t ${image} .
              trivy image --exit-code 1 --severity HIGH,CRITICAL ${image}
              aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 176381609267.dkr.ecr.us-east-1.amazonaws.com
              docker push ${image}
            """
          }
        }
      }
    }

    stage('Deploy to EKS') {
      steps {
        script {
          sh """
            kubectl apply -f k8s/backend-deployment.yaml
            kubectl apply -f k8s/backend-service.yaml
            kubectl apply -f k8s/frontend-deployment.yaml
            kubectl apply -f k8s/frontend-service.yaml
            kubectl apply -f k8s/ingress.yaml
          """
        }
      }
    }
  }
}
