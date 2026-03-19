import { NextRequest, NextResponse } from 'next/server';
import { friendshipDB } from '@/lib/friendship';

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId } = await request.json();

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'المعرفات المطلوبة غير متوفرة' },
        { status: 400 }
      );
    }

    const friendRequest = await friendshipDB.sendFriendRequest(senderId, receiverId);
    
    if (!friendRequest) {
      return NextResponse.json(
        { error: 'فشل في إرسال طلب الصداقة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request: friendRequest });
  } catch (error) {
    console.error('Error in friend request API:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'pending' or 'sent'

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    let requests;
    if (type === 'sent') {
      requests = await friendshipDB.getSentRequests(userId);
    } else {
      requests = await friendshipDB.getPendingRequests(userId);
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
