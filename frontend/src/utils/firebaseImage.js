// src/utils/firebaseUpload.js
import { app } from "../config/firebase";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export async function uploadImageToFirebase(file, path = "products/images/") {
  const storage = getStorage(app);
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `${path}${filename}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImageFromFirebase(imageUrl) {
  const storage = getStorage(app);
  const filePath = decodeURIComponent(imageUrl.split("/o/")[1].split("?")[0]);
  const imageRef = ref(storage, filePath);
  await deleteObject(imageRef);
}
