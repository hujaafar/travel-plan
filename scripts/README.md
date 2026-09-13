# Operations scripts
Run `python -m pip install -r scripts/requirements.txt`, then `python scripts/bootstrap.py`.
`start.ps1` uses the single-replica laptop profile; base Compose defaults to two replicas.
All generated credentials, PKI and Vault recovery material stay in ignored `.secrets/`.
