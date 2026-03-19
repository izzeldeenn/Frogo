import { NextRequest, NextResponse } from 'next/server';
import { friendshipDB } from '@/lib/friendship';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    const friends = await friendshipDB.getUserFriends(userId);
    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user1Id, user2Id } = await request.json();

    if (!user1Id || !user2Id) {
      return NextResponse.json(
        { error: 'معرفات المستخدمين مطلوبة' },
        { status: 400 }
      );
    }

    const success = await friendshipDB.removeFriend(user1Id, user2Id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'فشل في إزالة الصديق' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
