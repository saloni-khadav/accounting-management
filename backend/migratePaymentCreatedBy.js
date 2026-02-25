// Migration Script: Fix Payment createdBy field from String to ObjectId
// Run this script once after deploying the Payment model changes

const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Account-Management:am12345@cluster0.maszntc.mongodb.net/accounting-management?retryWrites=true&w=majority';

async function migratePaymentCreatedBy() {
  try {
    console.log('🔄 Starting Payment createdBy migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all payments
    const payments = await Payment.find({}).lean();
    console.log(`📊 Found ${payments.length} payments to check`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const payment of payments) {
      try {
        // Check if createdBy is a string or invalid ObjectId
        if (!payment.createdBy) {
          console.log(`⏭️  Skipping payment ${payment.paymentNumber} - no createdBy field`);
          skippedCount++;
          continue;
        }
        
        // Check if it's already a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(payment.createdBy)) {
          // Try to verify if it's a valid user
          const user = await User.findById(payment.createdBy);
          if (user) {
            console.log(`✅ Payment ${payment.paymentNumber} already has valid user reference`);
            skippedCount++;
            continue;
          }
        }
        
        // If createdBy is a string (name or email), try to find the user
        const createdByStr = String(payment.createdBy);
        
        // Try to find user by name or email
        const user = await User.findOne({
          $or: [
            { name: { $regex: new RegExp(createdByStr, 'i') } },
            { email: { $regex: new RegExp(createdByStr, 'i') } }
          ]
        });
        
        if (user) {
          // Update payment with user ObjectId
          await Payment.updateOne(
            { _id: payment._id },
            { $set: { createdBy: user._id } }
          );
          console.log(`✅ Updated payment ${payment.paymentNumber} - createdBy set to ${user.name} (${user._id})`);
          updatedCount++;
        } else {
          // User not found, set createdBy to null
          await Payment.updateOne(
            { _id: payment._id },
            { $unset: { createdBy: "" } }
          );
          console.log(`⚠️  Payment ${payment.paymentNumber} - User not found, createdBy set to null`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing payment ${payment.paymentNumber}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${payments.length}`);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run migration
migratePaymentCreatedBy();
