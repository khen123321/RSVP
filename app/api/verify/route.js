import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/lib/models/Guest';

export async function POST(request) {
  try {
    const body = await request.json();
    const { qr_token } = body;

    if (!qr_token || typeof qr_token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid QR token is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const guest = await Guest.findOne({ qr_token: qr_token.trim() });

    // Case 1: Guest not found
    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          status: 'INVALID',
          error: 'Invalid QR Code. No guest found for this ticket.',
        },
        { status: 404 }
      );
    }

    // Case 2: Already checked in
    if (guest.has_attended) {
      return NextResponse.json(
        {
          success: false,
          status: 'DUPLICATE',
          error: 'Ticket Already Used. This guest has already been checked in.',
          name: guest.name,
          pax: guest.pax,
        },
        { status: 400 }
      );
    }

    // Case 3: Valid — mark as attended
    guest.has_attended = true;
    await guest.save();

    return NextResponse.json(
      {
        success: true,
        status: 'GRANTED',
        message: 'Access Granted! Welcome to the celebration!',
        name: guest.name,
        pax: guest.pax,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[VERIFY API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}