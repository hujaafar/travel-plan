# Operations scripts
Run `python -m pip install -r scripts/requirements.txt`, then `python scripts/bootstrap.py`.
`start.ps1` uses the single-replica laptop profile; base Compose defaults to two replicas.
All generated credentials, PKI and Vault recovery material stay in ignored `.secrets/`.

On POSIX hosts bootstrap sets umask `077` before writing, keeps `.secrets/` at `0700`, and restricts operator provisioning files, the Vault root token, CA private key and root `.env` to `0600`. It repairs existing operator-file modes on rerun. The specifically mounted per-service TLS/AppRole files, PostgreSQL init SQL and Grafana provisioning remain readable inside their non-root containers; the private host parent prevents other host users from reaching those exports. Do not mount the entire `.secrets/` directory into an application container.

Windows retains the existing user-profile ACL. The script does not alter home-directory ACLs; keep the checkout and `.secrets/` within the owner's protected account directories. Actual Docker startup is a separate validation from these filesystem checks.

Run `python -m unittest discover -s scripts/tests -v` to check the isolated permission helper without invoking bootstrap or Docker. POSIX mode checks require a native Linux filesystem; on Windows they are explicitly skipped. On this laptop they can run under WSL with temporary fixtures in `/tmp`.
