import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEventEntity } from './entities/match-event.entity';
import { MatchProposalEntity } from './entities/match-proposal.entity';
import { MatchEntity } from './entities/match.entity';
import { RememberedDecisionEntity } from './entities/remembered-decision.entity';

// Sole writer of match_events and its three projections (ADR-0007).
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MatchEventEntity,
      MatchEntity,
      MatchProposalEntity,
      RememberedDecisionEntity,
    ]),
  ],
})
export class MatchLedgerModule {}
