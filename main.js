import "./style.css";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4FTgwpIWFqSixBVDCmIdpg3GQpShLDIU",
  authDomain: "udemy-d3-firebase-8e15b.firebaseapp.com",
  projectId: "udemy-d3-firebase-8e15b",
  storageBucket: "udemy-d3-firebase-8e15b.appspot.com",
  messagingSenderId: "587870448276",
  appId: "1:587870448276:web:7d6f8461fdfe71b3f36281",
  measurementId: "G-ENZDMCR6EB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const expensesRef = collection(db, "expenses");

//add documents to database
const form = document.querySelector("form");
const name = document.querySelector("#name");
const cost = document.querySelector("#cost");
const error = document.querySelector("#error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (name.value && cost.value) {
    const item = {
      name: name.value,
      cost: parseInt(cost.value),
    };
    addDoc(expensesRef, item).then((res) => {
      name.value = "";
      cost.value = "";
      error.textContent = "";
    });
  } else {
    error.textContent = "Please enter values before submitting";
  }
});

// getDocs(expensesRef).then((res) => {
//   let data = [];
//   console.log(res.docs);
// });
