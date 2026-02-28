require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const deleteClients = async () => {
  try {
    const result = await Client.deleteMany({
      clientCode: { $in: ['CC011', 'CC010'] }
    });
    
    console.log(`${result.deletedCount} clients deleted successfully`);
    console.log('Deleted client codes: CC011, CC010');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error deleting clients:', error);
    mongoose.connection.close();
  }
};

deleteClients();
