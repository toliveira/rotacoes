import { config } from '@dotenvx/dotenvx';
import { initializeFirebase, getAuth, getFirestore } from '../firebase';
// Load environment variables
config();

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

if (!email || !password) {
  console.error('Usage: npx tsx server/scripts/seed_admin.js <email> <password>');
  process.exit(1);
}

async function main() {
  console.log('Initializing Firebase...');
  // Initialize the app using the shared logic
  initializeFirebase();
  
  const auth = getAuth();
  const db = getFirestore();

  console.log(`Processing admin user: ${email}`);

  let userRecord;
  try {
    try {
      userRecord = await auth.createUser({
        email,
        password,
        emailVerified: true,
      });
      console.log('User created in Firebase Auth');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('User already exists in Firebase Auth, fetching...');
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw error;
      }
    }
  } catch (error) {
    throw error;
  }

  console.log('Setting admin role in Firestore...');
  const userRef = db.collection('users').doc(userRecord.uid);
  
  // Create or update the user document with admin role
  await userRef.set({
    uid: userRecord.uid,
    email,
    role: 'admin',
    updatedAt: new Date(),
    createdAt: new Date(),
  }, { merge: true });

  console.log('Done! Admin user seeded successfully.');
  process.exit(0);
}

main().catch(error => {
  console.error('Error seeding admin user:', error);
  process.exit(1);
});
