import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, pax, qr_token } = body;

    if (!name || !pax || !qr_token) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, pax, or qr_token.' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid full name.' },
        { status: 400 }
      );
    }

    if (typeof pax !== 'number' || pax < 1 || pax > 10) {
      return NextResponse.json(
        { success: false, error: 'Number of guests must be between 1 and 10.' },
        { status: 400 }
      );
    }

    await connectDB();

    const guest = await Guest.create({
      name: name.trim(),
      pax,
      qr_token,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'RSVP submitted successfully!',
        data: {
          name: guest.name,
          pax: guest.pax,
          qr_token: guest.qr_token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[RSVP API Error]:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'This RSVP token already exists. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An internal server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}