// src/components/AddProductWithImage.js

import React, { useState } from 'react';
import { db, storage } from '../firebase'; // Firebase imports
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storage imports
import { collection, addDoc } from 'firebase/firestore'; // Firestore imports

const AddProductWithImage = ({ userId, username }) => {
  const [productDetails, setProductDetails] = useState({
    name: '',
    price: 0,
    points: 0,
    imageFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails({ ...productDetails, [name]: value });
  };

  const handleFileChange = (e) => {
    setProductDetails({ ...productDetails, imageFile: e.target.files[0] });
  };

  const addProduct = async () => {
    try {
      if (productDetails.imageFile) {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `products/${productDetails.imageFile.name}`);
        await uploadBytes(storageRef, productDetails.imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Add product to the 'allProducts' collection in Firestore
        const productsRef = collection(db, 'allProducts');
        await addDoc(productsRef, {
          name: productDetails.name,
          price: productDetails.price,
          points: productDetails.points,
          imageUrl: imageUrl,
          addedBy: userId,
          addedByUsername: username,
        });

        console.log('Product added successfully with image.');
      } else {
        alert('Please select an image to upload.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
    }
  };

  return (
    <div>
      <h3>Add Product with Image</h3>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={productDetails.name}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Product Price"
        value={productDetails.price}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="points"
        placeholder="Product Points"
        value={productDetails.points}
        onChange={handleInputChange}
      />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={addProduct}>Add Product</button>
    </div>
  );
};

export default AddProductWithImage;
