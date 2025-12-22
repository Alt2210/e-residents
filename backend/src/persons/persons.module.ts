import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { Person, PersonSchema } from '../schemas/person.schema';
import { Household, HouseholdSchema } from '../schemas/household.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Person.name, schema: PersonSchema },
      { name: Household.name, schema: HouseholdSchema },
    ]),
  ],
  providers: [PersonsService],
  controllers: [PersonsController],
  exports: [PersonsService],
})
export class PersonsModule {}

