
import { useRouter } from "next/router";

export default function IntroScreen() {
  const router = useRouter();
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome to PulseGuide</h1>
        <p className="text-gray-700 text-lg mb-8">
          PulseGuide is your HR and benefits assistant. Ask about coverage, compare plans, find wellness perks, understand financial benefits, and more — all personalized to your PulseTel profile.
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800"
        >
          Start Chatting
        </button>
      </div>
    </div>
  );
}
