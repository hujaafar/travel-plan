FROM jenkins/jenkins:lts-jdk21
RUN jenkins-plugin-cli --plugins workflow-aggregator git credentials-binding sonar ssh-agent configuration-as-code matrix-auth timestamper
COPY casc.yml /usr/share/jenkins/casc.yml
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/casc.yml
