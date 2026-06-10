import mongoose from 'mongoose';

const maskMongoUri = (uri: string) =>
  uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/i, '$1***:***@');

const printAuthHelp = (uri: string) => {
  const isAtlas = uri.includes('mongodb.net') || uri.startsWith('mongodb+srv://');

  console.error('\n[mongodb] Connection failed — the API cannot start without a database.\n');

  if (isAtlas) {
    console.error('Your MONGO_URI points to MongoDB Atlas. "bad auth" usually means:');
    console.error('  1. Wrong username or password in server/.env');
    console.error('  2. Password contains special characters — URL-encode them (e.g. @ → %40, # → %23)');
    console.error('  3. Database user was deleted or password was rotated in Atlas');
    console.error('\nFix in Atlas: Database Access → edit user → reset password → update MONGO_URI');
    console.error('Format: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/palette?retryWrites=true&w=majority');
  } else {
    console.error('For local MongoDB, install MongoDB Community Server and use:');
    console.error('  MONGO_URI=mongodb://127.0.0.1:27017/palette');
    console.error('Or start the MongoDB Windows service, then restart the server.');
  }

  console.error(`\nConfigured URI (masked): ${maskMongoUri(uri)}\n`);
};

const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI?.trim();
  const mongoUri = configuredUri || 'mongodb://127.0.0.1:27017/palette';
  const uriSource = configuredUri ? 'MONGO_URI from .env' : 'default local URI';

  console.log(`MongoDB URI source: ${uriSource}`);
  if (configuredUri) {
    console.log(`MongoDB target (masked): ${maskMongoUri(mongoUri)}`);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);

    if (/auth|authentication|bad auth/i.test(message)) {
      printAuthHelp(mongoUri);
    }

    process.exit(1);
  }
};

export default connectDB;
