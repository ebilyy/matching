// Values of imports.kind / source / status. VARCHAR without CHECK in the schema
// (rules/migrations.md): the allowed set lives here only.

// One pipeline for both file kinds (ADR-0002).
export enum ImportKind {
  Catalog = 'catalog',
  Price = 'price',
}

export enum ImportSource {
  Upload = 'upload',
  Feed = 'feed',
}

// queued → processing → applied | rejected | awaiting_mapping (SAD §6 flows 1, 2).
export enum ImportStatus {
  Queued = 'queued',
  Processing = 'processing',
  Applied = 'applied',
  Rejected = 'rejected',
  AwaitingMapping = 'awaiting_mapping',
}
