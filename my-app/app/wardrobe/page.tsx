import { auth } from "@clerk/nextjs/server";
import WardrobeClient from "./wardrobeClient";

export default async function WardrobePage() {
  await auth.protect();

  return <WardrobeClient />;
}