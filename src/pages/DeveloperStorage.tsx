import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import your Firebase app configuration
import { getAuth } from "firebase/auth"; // Import getAuth from firebase/auth
import CryptoJS from "crypto-js"; // Import the encryption library
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuditLog {
  id: string;
  action: string;
  timestamp: any;
  metadata: any;
}

const DeveloperStorage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [secretName, setSecretName] = useState("");
  const [secretNames, setSecretNames] = useState<string[]>([]);
  // const [showSecrets, setShowSecrets] = useState(false);
  const [showSecrets, setShowSecrets] = useState(true);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showDecryption, setShowDecryption] = useState(false);
  const [secretValue, setSecretValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [decryptionSecretName, setDecryptionSecretName] = useState("");
  const [decryptedValue, setDecryptedValue] = useState("");
  const [deleteConfirmSecret, setDeleteConfirmSecret] = useState<string | null>(
    null
  );
  const [confirmationInput, setConfirmationInput] = useState("");
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [passphrase, setPassphrase] = useState("");

  const logAuditTrail = async (
    userId: string,
    action: string,
    metadata: any = {}
  ) => {
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

  function deriveKey(passphrase: string, salt: string) {
    return CryptoJS.PBKDF2(passphrase, salt, {
      keySize: 256 / 32,
      iterations: 100000,
    }).toString();
  }

  const handleSaveSecret = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretName || !secretValue || !passphrase) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "User is not authenticated.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 🔹 Generate strong key using PBKDF2 with a random salt
      const salt = CryptoJS.lib.WordArray.random(16).toString();
      const encryptionKey = deriveKey(passphrase, salt);

      // 🔹 Compute HMAC for integrity verification
      const hmac = CryptoJS.HmacSHA256(secretValue, encryptionKey).toString();

      // 🔹 Encrypt only the secret value (not the name)
      const encryptedSecret = CryptoJS.AES.encrypt(
        secretValue + "::" + hmac,
        encryptionKey
      ).toString();

      // 🔹 Save secret to Firestore (name in plain text)
      await addDoc(collection(db, "developerSecrets"), {
        userId: user.uid,
        secretName, // Store plain text
        secretValue: encryptedSecret, // Store encrypted value
        salt, // Store salt for decryption
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Success!",
        description: "Your secret has been encrypted and stored securely.",
        variant: "default",
      });

      // Clear form fields
      setSecretName("");
      setSecretValue("");
      setPassphrase("");

      // Log audit trail
      await logAuditTrail(user.uid, "Secret Encrypted", { secretName });
    } catch (error) {
      console.error("Error saving secret:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while saving the secret. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptSecret = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decryptionSecretName || !passphrase) {
      toast({
        title: "Missing Fields",
        description: "Please provide the secret name and passphrase.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "User is not authenticated.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 🔹 Query Firestore for the selected secret
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid),
        where("secretName", "==", decryptionSecretName) // Match by plain-text name
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Not Found",
          description: "No secret found with the given name.",
          variant: "destructive",
        });
        setDecryptionSecretName("");
        setPassphrase("");
        setIsLoading(false);
        return;
      }

      const secretData = querySnapshot.docs[0].data();
      const encryptedSecretValue = secretData.secretValue;
      const salt = secretData.salt; // Retrieve salt for key derivation

      // 🔹 Derive key using passphrase and stored salt
      const encryptionKey = deriveKey(passphrase, salt);

      // 🔹 Decrypt the secret value
      const bytes = CryptoJS.AES.decrypt(encryptedSecretValue, encryptionKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        await logAuditTrail(user.uid, "Secret Decryption Failed", {
          secretName: decryptionSecretName,
        });
        toast({
          title: "Decryption Failed",
          description: "Incorrect passphrase. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 🔹 Verify HMAC integrity
      const [originalValue, storedHmac] = decryptedText.split("::");
      const computedHmac = CryptoJS.HmacSHA256(
        originalValue,
        encryptionKey
      ).toString();

      if (storedHmac !== computedHmac) {
        await logAuditTrail(user.uid, "Secret Integrity Check Failed", {
          secretName: decryptionSecretName,
        });
        toast({
          title: "Integrity Check Failed",
          description:
            "Secret integrity check failed. Possible tampering detected.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 🔹 Display decrypted secret
      setDecryptedValue(originalValue);
      await logAuditTrail(user.uid, "Secret Decrypted", {
        secretName: decryptionSecretName,
      });

      toast({
        title: "Success!",
        description: "Secret decrypted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error decrypting secret:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while decrypting the secret. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDecryptionSecretName("");
      setPassphrase("");
      setIsLoading(false);
    }
  };

  const fetchSecrets = async () => {
    try {
      setIsLoading(true);
      setShowSecrets(false);
      setShowEncryption(false);
      setShowDecryption(false);
      setShowAuditTrail(false);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("User is not authenticated.");
        setIsLoading(false);
        return;
      }

      // 🔹 Fetch secret names from Firestore (without decryption)
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setSecretNames([]);
        setShowSecrets(true);
        setIsLoading(false);
        return;
      }

      // Extract secret names directly
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

  useEffect(() => {
    fetchSecrets();
  }, []);

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

      // 🔹 Query all matching secrets for deletion
      const q = query(
        collection(db, "developerSecrets"),
        where("userId", "==", user.uid),
        where("secretName", "==", deleteConfirmSecret)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Secret not found.");
        return;
      }

      // 🔹 Delete all matching documents
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // 🔹 Update UI state after deletion
      setSecretNames((prevNames) =>
        prevNames.filter((name) => name !== deleteConfirmSecret)
      );
      setDeleteConfirmSecret(""); // Reset input
      setConfirmationInput(""); // Clear confirmation

      // 🔹 Log deletion event (Moved outside try-catch to ensure logging happens)
      await logAuditTrail(user.uid, "Secret Deleted", {
        secretName: deleteConfirmSecret,
      });
    } catch (error) {
      console.error("Error deleting secret:", error);
      alert("An error occurred while deleting the secret. Please try again.");
    }
  };

  const fetchAuditLogs = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "audit_logs"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const logs: AuditLog[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            userId: doc.data().userId,
            action: doc.data().action,
            timestamp: doc.data().timestamp,
            metadata: doc.data().metadata || {}, // Default empty object
          }));

          setAuditLogs(logs);
        } catch (error) {
          console.error("Error processing audit logs:", error);
        }
      });

      return unsubscribe; // Cleanup on unmount
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
            onClick={() => {
              fetchSecrets();
              setDecryptedValue("");
            }}
          >
            Home
          </Button>
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={() => {
              setShowEncryption(true);
              setShowDecryption(false);
              setShowSecrets(false);
              setShowAuditTrail(false);
              setDecryptedValue("");
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
              setShowAuditTrail(false);
              setDecryptedValue("");
            }}
          >
            Decrypt
          </Button>
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={() => {
              setShowAuditTrail(true);
              setShowEncryption(false);
              setShowDecryption(false);
              setShowSecrets(false);
              fetchAuditLogs(); // Fetch logs when button is clicked
              setDecryptedValue("");
            }}
          >
            Audit Trail
          </Button>
          <Button
            className="bg-black border text-white hover:bg-white hover:text-black"
            onClick={() => {
              handleBack();
            }}
          >
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
            <br />
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
                    <div className="space-y-2">
                      <Label htmlFor="passPhrase">Enter Passphrase</Label>
                      <Input
                        id="passPhrase"
                        type="password"
                        placeholder="Enter PassPhrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
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
                    <div className="space-y-2">
                      <Label htmlFor="passPhrase">Enter Passphrase</Label>
                      <Input
                        id="passPhrase"
                        type="password"
                        placeholder="Enter PassPhrase"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
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
                        <p className="text-gray-600">Decrypted Secret:</p>
                        <p className="text-gray-600">{decryptedValue}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        {showAuditTrail && (
          <Card className="border-none shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  Audit Trail
                </h2>
              </div>
            </CardHeader>
            <br />
            <CardContent className="space-y-6">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500 text-center">No logs available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Timestamp</th>
                        <th className="px-4 py-2 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, index) => (
                        <tr
                          key={log.id}
                          className={`border-b ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100 transition`}
                        >
                          <td className="px-4 py-2 font-medium">
                            {log.action}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {new Date(
                              log.timestamp.seconds * 1000
                            ).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {Object.keys(log.metadata).length > 0 ? (
                              <pre className="bg-gray-200 p-2 rounded-md text-sm">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default DeveloperStorage;
