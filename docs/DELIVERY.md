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

The supplied SonarQube Community Build supports main-branch analysis. In the Jenkins multibranch job, **both Sonar analysis and its quality-gate wait run only on `main`**. PR and other feature-branch jobs skip both stages, so they neither request unsupported PR analysis nor publish their code into the main Sonar project. They still run Java units, dashboard build/unit/format checks, dependency auditing, and container builds. Require these Jenkins checks and an independent human review before merging. The Community main-branch gate runs after the merge and blocks staging deployment; it does not provide a pre-merge Sonar PR gate. Meeting a review requirement for Sonar analysis on every PR needs a supported PR-analysis offering and its Git-host integration, configured separately. No license, cloud project, or independent approval has been supplied. See the current [SonarQube feature comparison](https://docs.sonarsource.com/sonarqube-community-build/feature-comparison-table).

SonarQube may require a larger Linux `vm.max_map_count` and at least 2 GB memory. Do not change the host sysctl blindly: follow the vendor's deployment requirements. Running the entire tools profile alongside the dashboard may exceed a laptop's memory budget.

Container builds use `compose.build.yml`, a separate model with the same image tags, Dockerfiles and build arguments as the runtime deployment, without runtime secrets, mounts or ports. A fresh PR checkout can build it without bootstrapping Vault or receiving production credentials:

```bash
docker compose -f compose.build.yml config --quiet
docker compose -f compose.build.yml build
```

Trusted non-PR builds initialize disposable development credentials and run integration/browser tests on a disposable agent. Deployment runs only for main with `DEPLOY_STAGING=true`, a successful main-branch Sonar gate, and an explicit Jenkins input approval. Configure `travel-plan-deploy` SSH credentials and `STAGING_INVENTORY` before enabling it. A clean PR pipeline and an independent review approval must precede merging; this file alone cannot enforce Git-host policy. Configuration validation does not demonstrate a completed Jenkins pipeline, Sonar gate, or deployment.

Official references: [Jenkins quality-gate integration](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/ci-integration/jenkins-integration/pipeline-pause), [Docker Compose Ansible module](https://docs.ansible.com/projects/ansible/latest/collections/community/docker/docker_compose_v2_module.html).

## Ansible

Use a Linux Ansible controller. The supplied package recipe supports **Ubuntu 22.04 LTS (jammy) and 24.04 LTS (noble)** with the universe repository enabled, where `docker-compose-v2` is available. An explicit preflight rejects Debian and other releases before changing packages; they need a distribution-specific provisioning recipe. This declared support has not yet been demonstrated by an executed Ansible deployment. The playbook creates a private directory, installs prerequisites, imports a reviewed source archive, provisions local development secrets, and starts the system with the requested replica count.

```bash
ansible-galaxy collection install -r infra/ansible/requirements.yml
git archive --format=tar.gz --output=travel-plan-source.tar.gz HEAD
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml \
  -e artifact_path="$PWD/travel-plan-source.tar.gz" -e replica_count=2
```

Copy `inventory.example.ini`, substitute the actual SSH host, and keep real inventory credentials outside Git. The example IP is documentation-only. The playbook does not publish a public domain or install production database replication. Its default ports remain localhost-only on the deployment host; use authenticated SSH forwarding for review.

## Maintenance

Renovate configuration proposes dependency updates without auto-merging. Review images and language dependencies regularly, run all checks, and patch promptly. Pin approved image digests for a release. Never include `.env`, `.secrets`, node_modules, target, or build reports in a source artifact.
