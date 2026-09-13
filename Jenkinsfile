pipeline {
  agent { label 'travel-plan-build' }
  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
  }
  parameters {
    booleanParam(name: 'DEPLOY_STAGING', defaultValue: false, description: 'Deploy an approved main build to the configured staging inventory')
  }
  environment {
    SONAR_PROJECT = 'travel-plan'
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Java tests and coverage') {
      steps { sh './mvnw -B -ntp install' }
      post { always { junit 'services/**/target/surefire-reports/*.xml' } }
    }
    stage('Dashboard checks') {
      steps {
        dir('dashboard') {
          sh 'npm ci'
          sh 'npx prettier --check src'
          sh 'npm run build'
          sh 'npm test'
          sh 'npm audit --audit-level=moderate'
        }
      }
    }
    stage('SonarQube analysis') {
      steps {
        withSonarQubeEnv('travel-plan-sonar') {
          sh 'mvn -B -ntp org.sonarsource.scanner.maven:sonar-maven-plugin:5.5.0.6356:sonar -Dsonar.projectKey=travel-plan'
        }
      }
    }
    stage('Quality gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
    stage('Container build') { steps { sh 'docker compose build' } }
    stage('Integration and browsers') {
      when { not { changeRequest() } }
      steps {
        // This stage runs on a dedicated disposable CI agent, never a developer workstation.
        sh 'python3 scripts/bootstrap.py'
        sh 'docker compose -f compose.yml -f compose.local.yml up -d --wait --wait-timeout 240'
        dir('dashboard') {
          sh 'npx playwright install --with-deps chromium firefox'
          sh 'PLAYWRIGHT_CHROMIUM=1 npm run test:e2e'
        }
      }
      post { always { archiveArtifacts artifacts: 'dashboard/playwright-report/**', allowEmptyArchive: true } }
    }
    stage('Deploy approved main') {
      when { allOf { branch 'main'; expression { params.DEPLOY_STAGING } } }
      input { message 'Deploy this tested main revision to staging?' }
      steps {
        sh 'git archive --format=tar.gz --output=travel-plan-source.tar.gz HEAD'
        sshagent(credentials: ['travel-plan-deploy']) {
          sh 'ansible-playbook -i "$STAGING_INVENTORY" infra/ansible/deploy.yml -e artifact_path="$WORKSPACE/travel-plan-source.tar.gz"'
        }
      }
    }
  }
  post {
    always { archiveArtifacts artifacts: 'services/**/target/site/jacoco/**', allowEmptyArchive: true }
  }
}
