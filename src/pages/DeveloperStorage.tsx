import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import your Firebase app configuration
import { getAuth } from "firebase/auth"; // Import getAuth from firebase/auth
import CryptoJS from "crypto-js"; // Import the encryption library

const DeveloperStorage = () => {
  const [secretName, setSecretName] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Your encryption key (store securely, e.g., in environment variables)
  const ENCRYPTION_KEY = "your-encryption-key"; // Change this to a strong key

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretName || !secretValue) {
      alert("Please fill out both fields.");
      return;
    }

    try {
      setIsLoading(true);

      // Encrypt the secret value using AES encryption
      const encryptedSecret = CryptoJS.AES.encrypt(secretValue, ENCRYPTION_KEY).toString();

      // Get the authenticated user
      const auth = getAuth(); // Get Auth instance
      const user = auth.currentUser; // Get the current user

      if (!user) {
        alert("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      // Save the encrypted secret to Firestore under the user's ID
      const docRef = await addDoc(collection(db, "developerSecrets"), {
        userId: user.uid, // Associate the secret with the user's UID
        secretName,
        secretValue: encryptedSecret, // Store the encrypted secret
        createdAt: new Date().toISOString(),
      });

      alert(`Secret saved successfully`);
      setSecretName(""); // Reset the form fields
      setSecretValue("");
    } catch (error) {
      console.error("Error saving secret:", error);
      alert("An error occurred while saving the secret. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        Store Developer Secrets
      </h1>

      <form onSubmit={handleSaveSecret}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
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
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Secret"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeveloperStorage;
