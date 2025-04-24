"use client";
import { io } from "socket.io-client";

// ვიყენებთ ბრაუზერის მიმდინარე მისამართს, ან ngrok-ის მისამართს თუ იგი ხელმისაწვდომია
const getSocketUrl = () => {
  // ხშირად ngrok ისეთ მისამართს იყენებს, რომელიც არ ემთხვევა მიმდინარე window.location.origin-ს
  // ამიტომ აქ უნდა განვსაზღვროთ ყველა შესაძლო მისამართი, რომელთანაც შევეცდებით დაკავშირებას
  const ngrokUrl = "https://5d2a-2a00-23c6-731a-4d01-5367-cc94-7ee4-ed7.ngrok-free.app";
  const localUrl = "http://localhost:3000";

  // თუ ვიმყოფებით ngrok-ის მისამართზე
  if (typeof window !== "undefined" && window.location.href.includes("ngrok")) {
    return ngrokUrl;
  }
  
  // სხვა შემთხვევაში ვიყენებთ ან მიმდინარე მისამართს, ან localhost-ს
  return typeof window !== "undefined" ? window.location.origin : localUrl;
};

export const socket = io(getSocketUrl(), {
  reconnectionDelayMax: 10000,
  autoConnect: true,
  withCredentials: true, // ეს საჭიროა CORS-ის დროს
  transports: ['websocket', 'polling'] // ჯერ websocket, მერე polling
});

// ზარის მოთხოვნის ტიპი
export type CallRequestType = {
  conversationId: string;
  receiverId: string;
  callType: "audio" | "video";
};

// ზარის პასუხის ტიპი
export type CallResponseType = {
  conversationId: string;
  accepted: boolean;
  callerId: string;
};

// ონლაინ სტატუსის ცვლილების ტიპი
export type UserStatusChangeType = {
  userId: string;
  isOnline: boolean;
};

// დიაგნოსტიკური ლოგები
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
  // შევეცადოთ ხელახლა დაკავშირებას
  setTimeout(() => {
    socket.connect();
  }, 3000);
});

// მეთოდები ზარების გასაგზავნად
export const socketMethods = {
  // ზარის მოთხოვნის გაგზავნა
  sendCallRequest: (data: CallRequestType) => {
    socket.emit("callRequest", data);
  },
  
  // ზარზე პასუხის გაგზავნა
  sendCallResponse: (data: CallResponseType) => {
    socket.emit("callResponse", data);
  },
  
  // ზარის დასრულების სიგნალი
  endCall: (conversationId: string, receiverId: string) => {
    socket.emit("endCall", { conversationId, receiverId });
  },
  
  // ონლაინ სტატუსის განახლება
  updateStatus: (isOnline: boolean) => {
    socket.emit("updateStatus", { isOnline });
  },
  
  // ოთახში შესვლა კონკრეტული საუბრისთვის
  joinRoom: (conversationId: string) => {
    socket.emit("joinRoom", conversationId);
  },
  
  // ოთახიდან გასვლა
  leaveRoom: (conversationId: string) => {
    socket.emit("leaveRoom", conversationId);
  }
};

export default socket;