import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HouseholdsService } from './households.service';
import { HouseholdsController } from './households.controller';
import { Household, HouseholdSchema } from '../schemas/household.schema';
import { Person, PersonSchema } from '../schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Household.name, schema: HouseholdSchema },
      { name: Person.name, schema: PersonSchema },
    ]),
  ],
  providers: [HouseholdsService],
  controllers: [HouseholdsController],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}

