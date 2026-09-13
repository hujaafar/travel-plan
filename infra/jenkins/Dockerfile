FROM jenkins/jenkins:lts-jdk21
RUN jenkins-plugin-cli --plugins workflow-aggregator git credentials-binding sonar ssh-agent configuration-as-code matrix-auth
COPY casc.yml /var/jenkins_home/casc.yml
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc.yml
