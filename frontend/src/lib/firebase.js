import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyA2emUhdyOc7Imc5WkyHhPJXAv9U057yJA",
  authDomain: "vexo-1fe58.firebaseapp.com",
  projectId: "vexo-1fe58",
  storageBucket: "vexo-1fe58.firebasestorage.app",
  messagingSenderId: "456949168414",
  appId: "1:456949168414:web:e7c484b5e7fa1d07d6310f"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth, RecaptchaVerifier, signInWithPhoneNumber }