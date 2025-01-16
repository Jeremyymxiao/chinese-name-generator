"use client";

import SignIn from "./sign_in";
import User from "./user";
import { useAuth } from "@/contexts/AuthContext";

export default function SignToggle() {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-x-2 px-2">
      {user ? <User /> : <SignIn />}
    </div>
  );
}
