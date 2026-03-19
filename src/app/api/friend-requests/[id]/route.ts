import { NextRequest, NextResponse } from 'next/server';
import { friendshipDB } from '@/lib/friendship';

export async function POST(request: NextRequest) {
  try {
    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير متوفرة' },
        { status: 400 }
      );
    }

    let success = false;
    if (action === 'accept') {
      success = await friendshipDB.acceptFriendRequest(requestId);
    } else if (action === 'reject') {
      success = await friendshipDB.rejectFriendRequest(requestId);
    } else {
      return NextResponse.json(
        { error: 'إجراء غير صالح' },
        { status: 400 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'فشل في معالجة طلب الصداقة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
