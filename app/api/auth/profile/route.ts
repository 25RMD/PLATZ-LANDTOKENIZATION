// app/api/auth/profile/route.ts
// This is a redirect handler for backward compatibility
// It redirects requests from /api/auth/profile to /api/profile

import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests
export async function GET(request: NextRequest) {
  // Forward the request to the new endpoint
  const newUrl = new URL('/api/profile', request.url);
  
  // Copy all headers from the original request
  const headers = new Headers(request.headers);
  
  // Create a new request to forward
  const newRequest = new Request(newUrl, {
    method: 'GET',
    headers,
    body: null,
  });
  
  // Forward the request to the new endpoint
  return await fetch(newRequest);
}

// Handle PUT requests for profile updates
export async function PUT(request: NextRequest) {
  // Forward the request to the new endpoint
  const newUrl = new URL('/api/profile', request.url);
  
  // Copy all headers from the original request
  const headers = new Headers(request.headers);
  
  // Create a new request to forward with the same body
  const newRequest = new Request(newUrl, {
    method: 'PUT',
    headers,
    body: request.body,
  });
  
  // Forward the request to the new endpoint
  return await fetch(newRequest);
}

// Handle PATCH requests for partial updates
export async function PATCH(request: NextRequest) {
  // Forward the request to the new endpoint
  const newUrl = new URL('/api/profile', request.url);
  
  // Copy all headers from the original request
  const headers = new Headers(request.headers);
  
  // Create a new request to forward with the same body
  const newRequest = new Request(newUrl, {
    method: 'PATCH',
    headers,
    body: request.body,
  });
  
  // Forward the request to the new endpoint
  return await fetch(newRequest);
}
