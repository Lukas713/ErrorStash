"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function signInWithCredentials(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard?welcome=1",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password."
        default:
          return "Something went wrong. Please try again."
      }
    }
    throw error
  }
  return null
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard?welcome=1" })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" })
}
