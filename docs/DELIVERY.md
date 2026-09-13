# CI, review and deployment

## Branch workflow

Work starts on `feature/admin-platform`. Use a feature branch for subsequent changes, then a pull request against main. The repository includes a Gitea PR template. This local implementation does not claim that a remote reviewer has approved it or that branch protection has been configured.

On the Git host, configure main to reject direct pushes, require at least one independent approval, dismiss stale approvals after changes, and require successful Jenkins checks. Configure SCM webhook delivery to a reachable authenticated Jenkins endpoint. Fork PRs must run without deployment or production credentials; use a trusted Jenkinsfile policy and restricted Sonar tokens.

## Jenkins and SonarQube

```powershell
python scripts/bootstrap.py
docker compose -f compose.yml -f compose.tools.yml --profile tools up -d --build jenkins sonar-db sonarqube sonar-tls
```

Jenkins: `https://localhost:18443`, admin password `JENKINS_ADMIN_PASSWORD` in `.secrets/bootstrap.json`. The controller has **zero build executors** and authenticated access. Attach a dedicated Linux build agent with label `travel-plan-build`, JDK 17+, Maven 3.9+, Node 22+, Python, Ansible, Docker CLI/Compose, and a disposable Docker daemon. The agent Dockerfile documents the base toolchain; it is not a preconnected Jenkins agent.

SonarQube: `https://localhost:19443`. Complete the vendor's initial account setup and change its initial password before exposing it. Create project `travel-plan`; add a project-scoped analysis token to Jenkins as a SonarQube server named `travel-plan-sonar`. Configure the SonarQube webhook to the Jenkins `/sonarqube-webhook/` endpoint and validate TLS trust. The services can reach each other through the Docker egress network using their service names, while host ports remain loopback-bound.

SonarQube may require a larger Linux `vm.max_map_count` and at least 2 GB memory. Do not change the host sysctl blindly: follow the vendor's deployment requirements. Running the entire tools profile alongside the dashboard may exceed a laptop's memory budget.

The Jenkinsfile builds and tests Java, builds/tests/formats the dashboard, audits npm dependencies, runs Sonar analysis, and blocks on its quality gate. It builds containers and runs integration/browser tests for trusted non-PR builds on a disposable agent. Deployment runs only for main with `DEPLOY_STAGING=true`, a successful gate, and an explicit Jenkins input approval. Configure `travel-plan-deploy` SSH credentials and `STAGING_INVENTORY` before enabling it. A clean pipeline and a review approval must precede merging; this file alone cannot enforce Git-host policy.

Official references: [Jenkins quality-gate integration](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/ci-integration/jenkins-integration/pipeline-pause), [Docker Compose Ansible module](https://docs.ansible.com/projects/ansible/latest/collections/community/docker/docker_compose_v2_module.html).

## Ansible

Use a Linux Ansible controller. The playbook targets Debian/Ubuntu deployment hosts, creates a private directory, installs prerequisites, imports a reviewed source archive, provisions local development secrets, and starts the system with the requested replica count.

```bash
ansible-galaxy collection install -r infra/ansible/requirements.yml
git archive --format=tar.gz --output=travel-plan-source.tar.gz HEAD
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml \
  -e artifact_path="$PWD/travel-plan-source.tar.gz" -e replica_count=2
```

Copy `inventory.example.ini`, substitute the actual SSH host, and keep real inventory credentials outside Git. The example IP is documentation-only. The playbook does not publish a public domain or install production database replication. Its default ports remain localhost-only on the deployment host; use authenticated SSH forwarding for review.

## Maintenance

Renovate configuration proposes dependency updates without auto-merging. Review images and language dependencies regularly, run all checks, and patch promptly. Pin approved image digests for a release. Never include `.env`, `.secrets`, node_modules, target, or build reports in a source artifact.
