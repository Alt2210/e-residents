import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceService } from './residence.service';
import { ResidenceController } from './residence.controller';
import { TemporaryResidence, TemporaryResidenceSchema } from '../schemas/temporary-residence.schema';
import { Absence, AbsenceSchema } from '../schemas/absence.schema';
import { Person, PersonSchema } from '../schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TemporaryResidence.name, schema: TemporaryResidenceSchema },
      { name: Absence.name, schema: AbsenceSchema },
      { name: Person.name, schema: PersonSchema },
    ]),
  ],
  providers: [ResidenceService],
  controllers: [ResidenceController],
  exports: [ResidenceService],
})
export class ResidenceModule {}

