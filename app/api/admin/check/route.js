import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Check if request has a body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json({ isAdmin: false });
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json({ isAdmin: false });
    }

    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ isAdmin: false });
    }

    // Get admin emails from environment variables
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsEnv.split(',').map(email => email.trim()).filter(email => email);
    
    // Check if the provided email is in the admin list
    const isAdmin = adminEmails.includes(email);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}