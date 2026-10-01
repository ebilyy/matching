---
id: T07
title: "Add an S3 storage adapter for uploaded originals"
status: todo
priority: P0
estimate: M  # 3 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T01]
layer: "infra"
module: "infrastructure/storage"
epic: product-matching
updated_at: "2026-10-01"
---

# T07 — Add an S3 storage adapter for uploaded originals

**Estimate:** M (3 h) · **Priority:** P0 · **Deps:** [T01](./t01-project-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0006](../adr/0006-store-uploads-in-managed-eu-s3-bucket-with-30-day-lifecycle.md)
- [data-model](../data-model.md) → `imports.storage_key`

## Scope

- `StoragePort` (`putStream`, `getStream`, `delete`) with an AWS SDK v3 S3 implementation; endpoint, region and bucket from config.
- Object keys namespaced by shop: `<shop_id>/<import_id>/<filename>`.
- Server-side encryption flag; no public ACL.

## Out of scope

- Bucket provisioning and lifecycle rule (T39).

## Definition of Ready

- [ ] T01 merged.

## Definition of Done

- [ ] Integration test against MinIO: put stream → get stream returns identical bytes; 50 MB upload does not buffer fully in memory.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
