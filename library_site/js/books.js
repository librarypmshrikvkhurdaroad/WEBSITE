import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { db, storage } from "./firebase.js";

const BOOKS_COL = 'books';

export async function addBook({ title, author, description, category, file }) {
  let coverURL = '';
  if (file) {
    const storageRef = ref(storage, `covers/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    coverURL = await getDownloadURL(snap.ref);
  }
  const docRef = await addDoc(collection(db, BOOKS_COL), {
    title, author, description, category, coverURL, available: true, createdAt: Date.now()
  });
  return docRef;
}

export async function listBooks() {
  const q = query(collection(db, BOOKS_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBook(id) {
  const d = await getDoc(doc(db, BOOKS_COL, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

export async function updateBook(id, data) {
  const refDoc = doc(db, BOOKS_COL, id);
  await updateDoc(refDoc, data);
}

export async function deleteBook(id) {
  await deleteDoc(doc(db, BOOKS_COL, id));
}

export async function searchBooks(qstr) {
  const all = await listBooks();
  const q = qstr.trim().toLowerCase();
  if (!q) return all;
  return all.filter(b => 
    (b.title && b.title.toLowerCase().includes(q)) ||
    (b.author && b.author.toLowerCase().includes(q)) ||
    (b.category && b.category.toLowerCase().includes(q))
  );
}
