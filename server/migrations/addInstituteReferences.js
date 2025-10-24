import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

dotenv.config();

const addInstituteReferences = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update users without institute field
    const usersUpdated = await User.updateMany(
      { institute: { $exists: false } },
      { $set: { institute: null } }
    );
    console.log(`Updated ${usersUpdated.modifiedCount} users with institute field`);

    // Update courses without institute field
    const coursesUpdated = await Course.updateMany(
      { institute: { $exists: false } },
      { $set: { institute: null } }
    );
    console.log(`Updated ${coursesUpdated.modifiedCount} courses with institute field`);

    // Update departments without institute field
    const departmentsUpdated = await Department.updateMany(
      { institute: { $exists: false } },
      { $set: { institute: null } }
    );
    console.log(`Updated ${departmentsUpdated.modifiedCount} departments with institute field`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addInstituteReferences();
