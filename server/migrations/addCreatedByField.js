import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Category from '../models/Category.js';

dotenv.config();

const addCreatedByField = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update courses: set createdBy to author if not set
    const coursesUpdated = await Course.updateMany(
      { createdBy: { $exists: false } },
      [{ $set: { createdBy: '$author' } }]
    );
    console.log(`Updated ${coursesUpdated.modifiedCount} courses with createdBy field`);

    // Update categories: set createdBy to null if not set (will be updated when admin edits)
    const categoriesUpdated = await Category.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: null } }
    );
    console.log(`Updated ${categoriesUpdated.modifiedCount} categories with createdBy field`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addCreatedByField();
