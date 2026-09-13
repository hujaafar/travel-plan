# Dedicated, disposable build agent. Attach through Jenkins SSH/inbound agent setup.
FROM maven:3.9.11-eclipse-temurin-17
USER root
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv git curl openssh-client ca-certificates && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/ci && /opt/ci/bin/pip install --no-cache-dir ansible-core==2.19.0 cryptography==46.0.3
ENV PATH="/opt/ci/bin:${PATH}"
COPY infra/ansible/requirements.yml /tmp/requirements.yml
RUN ansible-galaxy collection install -r /tmp/requirements.yml
# Provision Node 22+, Docker CLI/Compose, and a TLS-authenticated disposable Docker
# daemon on the build host. Never mount the production Docker socket in a PR agent.
