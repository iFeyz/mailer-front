import { NextResponse } from 'next/server';

const API_URL = 'http://localhost:8080';
const API_KEY = 'FSFJDBGJLFEUFNJSJNSQ';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/lists/${params.id}`, {
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
