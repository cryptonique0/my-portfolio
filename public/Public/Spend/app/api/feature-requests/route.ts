import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (replace with DB in production)
let requests: Array<{
  id: number;
  title: string;
  description: string;
  votes: number;
  voters: string[];
}> = [];
let nextId = 1;

export async function GET() {
  // For demo, no user auth, so userVoted is always false
  return NextResponse.json({
    requests: requests.map(r => ({
      ...r,
      userVoted: false,
    }))
  });
}

export async function POST(req: NextRequest) {
  const { title, description } = await req.json();
  if (!title || !description) {
    return NextResponse.json({ success: false, message: "Title and description required" }, { status: 400 });
  }
  const newRequest = { id: nextId++, title, description, votes: 0, voters: [] };
  requests.push(newRequest);
  return NextResponse.json({ success: true, request: newRequest });
}
