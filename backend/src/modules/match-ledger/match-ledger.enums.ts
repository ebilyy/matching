// Values of the match-ledger VARCHAR columns. No CHECK in the schema
// (rules/migrations.md): the allowed set lives here only.

// match_events.type, PascalCase verbatim (openapi MatchEventType). Adding a type
// is an additive change; payload shape is versioned by schema_version.
export enum MatchEventType {
  AutoMatched = 'AutoMatched',
  ProposalCreated = 'ProposalCreated',
  ProposalConfirmed = 'ProposalConfirmed',
  ProposalRejected = 'ProposalRejected',
  MatchCancelled = 'MatchCancelled',
  ReturnedToQueue = 'ReturnedToQueue',
}

// matches.origin: which cascade stage or decision produced the match.
export enum MatchOrigin {
  AutoCode = 'auto_code',
  AutoRemembered = 'auto_remembered',
  Confirmed = 'confirmed',
}

// match_proposals.reason (AC-06, AC-07, AC-11).
export enum ProposalReason {
  AmbiguousCode = 'ambiguous_code',
  Similar = 'similar',
  FingerprintChanged = 'fingerprint_changed',
}

// remembered_decisions.decision. A cancellation (AC-13) is stored as rejected (TBD-6).
export enum Decision {
  Confirmed = 'confirmed',
  Rejected = 'rejected',
}
