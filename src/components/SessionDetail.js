import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import Firestore instance
import { doc, getDoc,arrayRemove,updateDoc } from 'firebase/firestore';
import { useParams,useNavigate } from 'react-router-dom';
import './SessionDetail.css'; // Import the CSS file

const SessionDetail = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const sessionRef = doc(db, 'shoppingSessions', sessionId);
        const docSnap = await getDoc(sessionRef);

        if (docSnap.exists()) {
          setSessionData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
      })
      .catch(error => {
        console.error("Failed to copy session ID:", error);
      });
  };
  const handleRemoveProduct = async (product) => {
    try {
      const sessionRef = doc(db, 'shoppingSessions', sessionId);
      await updateDoc(sessionRef, {
        products: arrayRemove(product),
      });

      // Update the local state after removal
      setSessionData(prevData => ({
        ...prevData,
        products: prevData.products.filter(p => p !== product),
      }));
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  const goToHome = () => {
    navigate('/');
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }
  console.log(sessionData);
  if (!sessionData) {
    return <div className="error-message">Session data not available.</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <button onClick={goToHome} className="btn-back">Back to Home Page</button>
        <h2 className="heading">Group Details</h2>
      </div>

      <div className="info-section">
        <p><strong>Group name:</strong> {sessionData.name}</p>
      </div>

      <div className="copy-section">
        <p><strong>Invite your friends to join the group:</strong></p>
        <button onClick={handleCopySessionId} className="btn-copy">
          {copied ? "Copied!" : "Copy Group ID"}
        </button>
      </div>

      <div className="section">
        <h3 className="sub-heading">Users</h3>
        <ul className="user-list">
          {sessionData.users.map((user, index) => (
            <li key={index} className="user-list-item">{user.username}</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3 className="sub-heading">Products</h3>
        {sessionData.products.length > 0 ? (
          <div className="products-container">
            {sessionData.products.map((product, index) => (
              <div key={index} className="product-card">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <p>&#8377;{product.price} - {product.points} Points</p>
                  <small>Added by: {product.addedByUsername}</small>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product)}
                  className="btn-remove"
                >
                  Remove Product
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-products-message">No products added to this Group yet.</p>
        )}
      </div>

      <div className="section">
        <p><strong>Created At:</strong> {sessionData.createdAt?.toDate().toLocaleString()}</p>
        <p><strong>Last Updated At:</strong> {sessionData.updatedAt?.toDate().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SessionDetail;
