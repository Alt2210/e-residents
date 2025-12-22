import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Person, PersonSchema } from '../schemas/person.schema';
import { Household, HouseholdSchema } from '../schemas/household.schema';
import { TemporaryResidence, TemporaryResidenceSchema } from '../schemas/temporary-residence.schema';
import { Absence, AbsenceSchema } from '../schemas/absence.schema';
import { Feedback, FeedbackSchema } from '../schemas/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Household.name, schema: HouseholdSchema },
      { name: TemporaryResidence.name, schema: TemporaryResidenceSchema },
      { name: Absence.name, schema: AbsenceSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}

