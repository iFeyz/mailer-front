import { NextRequest, NextResponse } from 'next/server';

const API_URL = '';
const API_KEY = 'FSFJDBGJLFEUFNJSJNSQ';

export const GET = async (
  req : NextRequest,
  res : NextResponse,
  { params }: { params: { id: string } }
) => {
  try {
    const id = parseInt(params.id);
    const response = await fetch(`${API_URL}/lists/${id}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch list: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}

export const PUT = async (
  req : NextRequest,
  res : NextResponse,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await req.json();
    const response = await fetch(`${API_URL}/lists/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to update list: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    );
  }
}

export const DELETE = async (
  req : NextRequest,
  res : NextResponse,
  { params }: { params: { id: string } }
) => {
  try {
    const response = await fetch(`${API_URL}/lists/${params.id}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete list: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    );
  }
}
