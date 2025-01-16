import { findUserByEmail, findUserByUuid, insertUser } from "@/models/user";
import { User } from "@/types/user";
import { headers } from "next/headers";
import { auth } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export async function saveUser(user: User) {
  try {
    const existUser = await findUserByEmail(
      user.email,
      user.signin_provider || ""
    );
    if (!existUser) {
      await insertUser(user);
    } else {
      user.id = existUser.id;
      user.uuid = existUser.uuid;
      user.created_at = existUser.created_at;
    }

    return user;
  } catch (e) {
    console.log("save user failed: ", e);
    throw e;
  }
}

export async function getUserUuid() {
  let user_uuid = "";

  const currentUser = auth.currentUser;
  if (currentUser) {
    user_uuid = currentUser.uid;
  }

  return user_uuid;
}

export function getBearerToken() {
  const h = headers();
  const auth = h.get("Authorization");
  if (!auth) {
    return "";
  }

  return auth.replace("Bearer ", "");
}

export async function getUserEmail() {
  let user_email = "";

  const currentUser = auth.currentUser;
  if (currentUser) {
    user_email = currentUser.email || "";
  }

  return user_email;
}

export async function getUserInfo() {
  let user_uuid = await getUserUuid();

  if (!user_uuid) {
    return;
  }

  const user = await findUserByUuid(user_uuid);

  return user;
}
