"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      if (auth.currentUser) {
        toast.success("Successfully signed in!");
      }
    } catch (error) {
      toast.error("Failed to sign in with Google");
      console.error(error);
    }
  };

  return (
    <Button variant="default" onClick={handleSignIn}>
      Sign In
    </Button>
  );
}
