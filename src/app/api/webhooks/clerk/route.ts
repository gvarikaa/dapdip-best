import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/prisma";
import { generateRandomBigHeadOptions } from '@/utils/avatarHelper';

// ვებჰუკში ვაგენერირებთ ავატარის პარამეტრებს და ვინახავთ მონაცემთა ბაზაში
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  if (eventType === "user.created") {
    try {
      // პარსინგი payload-ის
      const userData = JSON.parse(body).data;
      const username = userData.username;
      
      // გამოიყენეთ ატვირთული სურათი თუ არსებობს
      const imageUrl = userData.image_url || null;
      
      // გენერირება შემთხვევითი ავატარის პარამეტრებისა
      const avatarProps = generateRandomBigHeadOptions();
      
      // მივიღოთ სქესი მეტადატიდან ან ავატარის პარამეტრებიდან
      const metadataGender = userData.unsafe_metadata?.gender || userData.public_metadata?.gender;
      const gender = metadataGender || (avatarProps.body === 'breasts' ? 'female' : 'male');
      
      await prisma.user.create({
        data: {
          id: evt.data.id,
          username: username,
          email: userData.email_addresses[0].email_address,
          img: imageUrl,
          gender: gender,
          avatarProps: JSON.stringify(avatarProps)
        },
      });
      return new Response("User created", { status: 200 });
    } catch (err) {
      console.log(err);
      return new Response("Error: Failed to create a user!", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await prisma.user.delete({ where: { id: evt.data.id } });
      return new Response("User deleted", { status: 200 });
    } catch (err) {
      console.log(err);
      return new Response("Error: Failed to delete a user!", {
        status: 500,
      });
    }
  }

  // თუ მომხმარებელი ანახლებს პროფილის სურათს
  if (eventType === "user.updated") {
    try {
      const userData = JSON.parse(body).data;
      
      // განვაახლოთ მომხმარებლის ინფორმაცია
      await prisma.user.update({
        where: { id: evt.data.id },
        data: { 
          img: userData.image_url || null,
          gender: userData.unsafe_metadata?.gender || userData.public_metadata?.gender || null
        }
      });
      
      return new Response("User updated", { status: 200 });
    } catch (err) {
      console.log(err);
      return new Response("Error: Failed to update user!", {
        status: 500,
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
}