import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; // Import Firestore and Auth
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate,useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import './CreateSession.css'; // Import CSS

const CreateSession = ({ userId, user }) => {
  const [sessionId, setSessionId] = useState(null);
  const [existingSessions, setExistingSessions] = useState([]);
  const [username, setUsername] = useState('');
  const [groupname, setGroupname] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // To hold the product being added
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage product modal visibility
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false); // To manage the "Create Session" modal
  const [selectedSessionId, setSelectedSessionId] = useState(null); // For tracking selected session
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const location = useLocation();

  const openJoinModal = () => {
    navigate('/join', { state: { background: location, userId, username } });
  };
  
  useEffect(() => {
    // Automatically set the username to the Google sign-in displayName
    if (auth.currentUser) {
      setUsername(auth.currentUser.displayName);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, 'allProducts');
        const productsSnapshot = await getDocs(productsCollectionRef);
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchExistingSessions = async () => {
      try {
        const sessionsRef = collection(db, 'shoppingSessions');
        const q = query(sessionsRef, where('userIds', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        console.log("Fetching sessions for userId:", userId);
        querySnapshot.forEach(doc => {
          console.log(doc.id, " => ", doc.data());
        });
        const sessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExistingSessions(sessions);
      } catch (error) {
        console.error("Error fetching existing sessions:", error);
      }
    };

    fetchExistingSessions();
  }, [userId]);

  const createShoppingSession = async () => {
    try {
      const sessionRef = doc(collection(db, 'shoppingSessions'));
      await setDoc(sessionRef, {
        name: groupname,
        userIds: [userId],
        users: [{ userId: userId, username: username }], // Store both userId and username as an object
        products: [],
        recommendations: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSessionId(sessionRef.id);
      setIsCreateSessionModalOpen(false); // Close modal after creation
      navigate(`/session/${sessionRef.id}`);
    } catch (error) {
      console.error("Error creating shopping session:", error);
    }
  };

  const addToSession = async (product, sessionId) => {
    if (!sessionId) {
      alert("Please create or join a session first.");
      return;
    }

    try {
      const sessionRef = doc(db, 'shoppingSessions', sessionId);
      await updateDoc(sessionRef, {
        products: arrayUnion({
          ...product,
          addedBy: userId,
          addedByUsername: username,
        }),
        updatedAt: serverTimestamp(),
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding product to session:", error);
    }
  };

  const openSessionSelectionModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSessionSelect = (sessionId) => {
    setSelectedSessionId(sessionId);
    addToSession(selectedProduct, sessionId);
  };

  return (
    <div className="session-container">
      <Navbar username={username}/>
      <div className='checker'>
        <div className="input-group">
          <button onClick={() => setIsCreateSessionModalOpen(true)} className="btn btn-primary">Start New Shopping Group</button>
        </div>
        <div>
        <div className="input-group">
        <button onClick={openJoinModal} className="btn btn-secondary">
          Join Existing Group
        </button>
        </div>
      </div>
        <div className="existing-sessions">
          <h3>Your Existing Groups</h3>
          <ul>
            {existingSessions.map(session => (
              <li key={session.id}>
                <a href={`/session/${session.id}`} className="session-link">{session.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isCreateSessionModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create a New Shopping Group</h3>
            <input
              type="text"
              placeholder="Enter Group Name"
              value={groupname}
              onChange={(e) => setGroupname(e.target.value)}
              className="input-field"
            />
            <button onClick={createShoppingSession} className="btn btn-primary">Create Group</button>
            <button onClick={() => setIsCreateSessionModalOpen(false)} className="btn btn-close">Close</button>
          </div>
        </div>
      )}

      <h3>Products</h3>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <h4>{product.name}</h4>
            <p>Price: &#8377;{product.price}</p>
            <p>Points: {product.points}</p>
            <button onClick={() => openSessionSelectionModal(product)} className="btn btn-add">Add to Group</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h4>Select a Group to Add Product to</h4>
            <ul>
              {existingSessions.map(session => (
                <li key={session.id}>
                  <button onClick={() => handleSessionSelect(session.id)} className="btn btn-modal">
                    {session.name}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => setIsModalOpen(false)} className="btn btn-close">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSession;
