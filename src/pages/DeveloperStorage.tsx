import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { collection, query, where, getDocs, addDoc, deleteDoc, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import your Firebase app configuration
import { getAuth } from "firebase/auth"; // Import getAuth from firebase/auth
import CryptoJS from "crypto-js"; // Import the encryption library
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const DeveloperStorage = () => {
  const navigate = useNavigate();

  const [secretName, setSecretName] = useState("");
  const [secretNames, setSecretNames] = useState<string[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  const [showEncryption, setShowEncryption] = useState(false); // Controls Encryption section
  const [showDecryption, setShowDecryption] = useState(false);
  const [secretValue, setSecretValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decryptionSecretName, setDecryptionSecretName] = useState("");
  const [decryptedValue, setDecryptedValue] = useState("");
  const [deleteConfirmSecret, setDeleteConfirmSecret] = useState<string | null>(
    null
  ); // Track which secret is being deleted
  const [confirmationInput, setConfirmationInput] = useState("");

  // Your encryption key (store securely, e.g., in environment variables)
  const ENCRYPTION_KEY = "your-encryption-key"; // Change this to a strong key

  const logAuditTrail = async (userId: string, action: string, metadata: any = {}) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        userId,
        action,
        timestamp: Timestamp.now(),
        metadata,
      });
    } catch (error) {
      console.error("Error logging audit trail:", error);
    }
  };

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretName || !secretValue) {
      alert("Please fill out both fields.");
      return;
    }

    try {
      setIsLoading(true);

      // Encrypt the secret value using AES encryption
      const encryptedSecret = CryptoJS.AES.encrypt(
        secretValue,
        ENCRYPTION_KEY
      ).toString();

      // Get the authenticated user
      const auth = getAuth(); // Get Auth instance
      const user = auth.currentUser; // Get the current user

      if (!user) {
        alert("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      // Save the encrypted secret to Firestore under the user's ID
      await addDoc(collection(db, "developerSecrets"), {
        userId: user.uid, // Associate the secret with the user's UID
        secretName,
        secretValue: encryptedSecret, // Store the encrypted secret
        createdAt: new Date().toISOString(),
      });

      

      alert(`Secret saved successfully`);
      setSecretName(""); // Reset the form fields
      setSecretValue("");

      await logAuditTrail(user.uid, "Added Secret", { secretName });
      
    } catch (error) {
      console.error("Error saving secret:", error);
      alert("An error occurred while saving the secret. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptSecret = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decryptionSecretName) {
      alert("Please provide the name of the secret to decrypt.");
      return;
    }

    try {
      setIsLoading(true);

      // Get the authenticated user
      const auth = getAuth(); // Get Auth instance
      const user = auth.currentUser; // Get the current user

      if (!user) {
        alert("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      // Query Firestore for the secret
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid),
        where("secretName", "==", decryptionSecretName)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No secret found with the given name.");
        setDecryptionSecretName("");
        setDecryptedValue("");
        setIsLoading(false);
        return;
      }

      const secretData = querySnapshot.docs[0].data();
      const encryptedSecretValue = secretData.secretValue;

      // Decrypt the secret value
      const bytes = CryptoJS.AES.decrypt(encryptedSecretValue, ENCRYPTION_KEY);
      const originalValue = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalValue) {
        alert("Failed to decrypt the secret. Please check the encryption key.");
        setIsLoading(false);
        return;
      }

      setDecryptedValue(originalValue);
    } catch (error) {
      console.error("Error decrypting secret:", error);
      alert("An error occurred while decrypting the secret. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecrets = async () => {
    try {
      setIsLoading(true);
      setShowSecrets(false);
      setShowEncryption(false);
      setShowDecryption(false);

      // Get the authenticated user
      const auth = getAuth(); // Get Auth instance
      const user = auth.currentUser; // Get the current user

      if (!user) {
        alert("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      // Query Firestore for secrets associated with the user
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No secrets found.");
        setSecretNames([]); // Clear the secret names
        setShowSecrets(true);
        setIsLoading(false);
        return;
      }

      // Extract secret names from the query snapshot
      const fetchedSecretNames = querySnapshot.docs.map(
        (doc) => doc.data().secretName
      );
      setSecretNames(fetchedSecretNames);
      setShowSecrets(true);
    } catch (error) {
      console.error("Error fetching secrets:", error);
      alert("An error occurred while fetching the secrets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSecret = async () => {
    if (confirmationInput !== "delete") {
      alert('You must type "delete" to confirm deletion.');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("User is not authenticated.");
        return;
      }

      // Query Firestore for the specific secret to delete
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid),
        where("secretName", "==", deleteConfirmSecret)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);

        // Update the state to remove the deleted secret
        setSecretNames((prevNames) =>
          prevNames.filter((name) => name !== deleteConfirmSecret)
        );

        alert("Secret deleted successfully.");
        setDeleteConfirmSecret(null); // Reset the deletion process
        setConfirmationInput(""); // Clear the input

        await logAuditTrail(user.uid, "Deleted Secret", { secretName: deleteConfirmSecret });

      } else {
        alert("Secret not found.");
      }
    } catch (error) {
      console.error("Error deleting secret:", error);
      alert("An error occurred while deleting the secret. Please try again.");
    } 
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Developer Secrets
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={fetchSecrets}
          >
            Home
          </Button>
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={() => {
              setShowEncryption(true);
              setShowDecryption(false);
              setShowSecrets(false);
            }}
          >
            Encrypt
          </Button>
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={() => {
              setShowDecryption(true);
              setShowEncryption(false);
              setShowSecrets(false);
            }}
          >
            Decrypt
          </Button>
          <Button className="bg-black border text-white hover:bg-white hover:text-black"
          >
            Audit Trail
          </Button>
          <Button className="bg-black border text-white hover:bg-white hover:text-black">
            Back
          </Button>
        </div>
        <br />

        {showSecrets && (
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Stored Secrets
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {secretNames.length > 0 ? (
                <ul className="space-y-2">
                  {secretNames.map((name, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 border rounded-lg shadow-sm hover:bg-gray-100 transition"
                    >
                      <span className="text-gray-700">{name}</span>
                      <Button
                        className="bg-red-600 hover:bg-red-800 px-3 py-1"
                        onClick={() => setDeleteConfirmSecret(name)}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No secrets found.</p>
              )}

              {deleteConfirmSecret && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-6 space-y-4 w-96">
                    <h3 className="text-lg font-bold text-gray-900">
                      Confirm Delete Secret
                    </h3>
                    <p className="text-gray-600">
                      To delete the secret{" "}
                      <strong>{deleteConfirmSecret}</strong>, type{" "}
                      <strong>delete</strong> below:
                    </p>
                    <input
                      type="text"
                      placeholder="Type 'delete' to confirm"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      className="w-full border rounded p-2"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                        onClick={() => {
                          setDeleteConfirmSecret(null);
                          setConfirmationInput("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
                        onClick={handleDeleteSecret}
                      >
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showEncryption && (
          <Card className="border-none shadow-xl">
            <form onSubmit={handleSaveSecret}>
              <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Encryption Section
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <br />
                      <Label htmlFor="secretName">Secret Name</Label>
                      <Input
                        id="secretName"
                        placeholder="Enter Secret Name"
                        value={secretName}
                        onChange={(e) => setSecretName(e.target.value)}
                        required
                      />
                    </div>
                    <br />
                    <div className="space-y-2">
                      <Label htmlFor="secretValue">Secret Value</Label>
                      <Input
                        id="secretValue"
                        placeholder="Enter Secret Value"
                        value={secretValue}
                        onChange={(e) => setSecretValue(e.target.value)}
                        required
                      />
                    </div>
                    <br />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Encrypt & Store"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        {showDecryption && (
          <Card className="border-none shadow-xl">
            <form onSubmit={handleDecryptSecret}>
              <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Decryption Section
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <br />
                      <Label htmlFor="decryptionSecretName">
                        Secret Name to Decrypt
                      </Label>
                      <Input
                        id="decryptionSecretName"
                        placeholder="Enter Secret Name"
                        value={decryptionSecretName}
                        onChange={(e) =>
                          setDecryptionSecretName(e.target.value)
                        }
                        required
                      />
                    </div>
                    <br />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Decrypting..." : "Decrypt"}
                      </Button>
                    </div>
                    <br />
                    {decryptedValue && (
                      <div className="mt-4">
                        <p className="text-gray-600">Decrypted Value:</p>
                        <p className="text-gray-600">{decryptedValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        
      </div>
    </>
  );
};

export default DeveloperStorage;
