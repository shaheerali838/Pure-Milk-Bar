const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const animals = await mongoose.connection.collection('animals').find({}).toArray();
    const animalMap = {};
    animals.forEach(a => {
      animalMap[a.tagNumber] = a._id;
    });

    const morningYields = {
      'TAG-0485': 9,
      'TAG-8751': 11,
      'TAG-1081': 11,
      'TAG-7922': 13,
      'TAG-8426': 12,
      'TAG-9002': 13,
    };

    const targetDate = new Date('2026-10-13T00:00:00.000Z');

    // 1. Clear out any duplicate/corrupted milking logs
    await mongoose.connection.collection('milkingyieldlogs').deleteMany({});

    // 2. Insert the 6 exact morning shift logs for 2026-10-13
    const logsToInsert = [];
    for (const [tag, yieldVal] of Object.entries(morningYields)) {
      const animalId = animalMap[tag];
      if (animalId) {
        logsToInsert.push({
          animalId: animalId,
          date: targetDate,
          shift: 'MORNING',
          yieldLiters: yieldVal,
          quantityLiters: yieldVal,
          createdAt: targetDate,
          updatedAt: new Date()
        });
      }
    }

    const insertRes = await mongoose.connection.collection('milkingyieldlogs').insertMany(logsToInsert);
    console.log('Inserted milkingyieldlogs count:', insertRes.insertedCount);

    // 3. Update animals intakeHistory
    for (const animal of animals) {
      const tag = animal.tagNumber;
      const morningVal = morningYields[tag] || 10;

      const newIntake = [
        {
          date: '2026-10-13',
          shift: 'Morning',
          quantityLiters: morningVal,
          yieldLiters: morningVal,
          morning: morningVal,
          evening: 0,
          createdAt: targetDate
        }
      ];

      await mongoose.connection.collection('animals').updateOne(
        { _id: animal._id },
        {
          $set: {
            intakeHistory: newIntake,
            history: newIntake,
            updatedAt: new Date()
          }
        }
      );
      console.log('Updated animal', tag, 'with morning yield:', morningVal);
    }

    // Verify
    const verifyLogs = await mongoose.connection.collection('milkingyieldlogs').find({}).toArray();
    const totalYield = verifyLogs.reduce((sum, l) => sum + (l.yieldLiters || 0), 0);
    console.log('Verified Milking Logs count:', verifyLogs.length, 'Total Yield:', totalYield, 'L');

    const updatedAnimals = await mongoose.connection.collection('animals').find({}).toArray();
    let animalTotal = 0;
    updatedAnimals.forEach(a => {
      (a.intakeHistory || []).forEach(h => {
        if (h.date === '2026-10-13') animalTotal += h.yieldLiters;
      });
    });
    console.log('Verified Animals Intake Total for 2026-10-13:', animalTotal, 'L');

    await mongoose.disconnect();
    console.log('Migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
})();
