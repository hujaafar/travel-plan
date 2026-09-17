# Solo-maintainer delivery exception

On 17 September 2026 the owner authorized a documented solo-owner merge exception after being told that it does not fulfill the assignment's independent-review requirement. No teammate was available. This is owner authorization to merge verified work, not a peer approval. No second identity or approving bot was created.

## Merge procedure

1. Keep `travel-plan/jenkins` and `travel-plan/live-tests` required and successful for the exact PR head. Keep administrator enforcement, strict up-to-date checks, resolved conversations, and force-push/deletion restrictions.
2. Record the owner exception, reviewed revision and evidence in the PR. Temporarily set the approving-review count to zero for this delivery; do not bypass or fabricate CI results.
3. Merge the PR normally, then restore the one-approval requirement for future changes. Record the resulting merge SHA and restored protection. A successful PR check does not by itself prove that a subsequent main-branch run passed.
4. Deliver the same source to the course repository. Course status forwarding must identify the exact tested SHA and link to the real GitHub run. If forwarding cannot be authenticated, report that blocker rather than invent a course check or remove a required CI gate.

This document records authorization and the procedure. The [GitHub PR](https://github.com/hujaafar/travel-plan/pull/1), [workflow runs](https://github.com/hujaafar/travel-plan/actions), and [course PR](https://learn.reboot01.com/git/hujaafar/travel-plan/pulls/1) are the authoritative records of which steps actually completed. Earlier audit/review documents are dated snapshots taken before this exception and retain their original evidence.

## Verified baseline and boundaries

Application revision `27b89d223fc7c2ca5c65c42a337bddbf2f59dc90` passed [run 35185811401](https://github.com/hujaafar/travel-plan/actions/runs/35185811401): 78 Java, 63 dashboard and 35 provisioning tests; 14 Chromium/Firefox scenarios; Jenkins/Sonar candidate analysis; actual Ubuntu Ansible deployment; internal TLS; centralized logging; Java replica recovery. Later commits need their own successful required checks.

A bounded AI-assisted inspection also covered authentication, authorization, CSRF, transactional CRUD, database cascades, the Neo4j outbox, provider endpoints, ingress and CI permissions. It did not establish an additional release-blocking defect in that scope, and it is not independent human approval or a security certification.

The assignment's approved collaborative review requirement remains an explicit exception. Owner Stripe/PayPal sandbox verification, supported Neo4j least privilege, and database/Vault/ingress high availability across independent failure domains remain separate gaps. Frontend unit line coverage was 15.6% and combined Sonar coverage 42.0%; passing tests do not prove complete feature/path coverage. Payment capture, refunds and webhooks are outside the phase-one gateway administration scope.

No public production deployment, paid subscription, new provider account, payment transaction, or infrastructure HA is claimed by this merge procedure.
