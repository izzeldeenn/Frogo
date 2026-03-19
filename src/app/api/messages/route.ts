import { NextRequest, NextResponse } from 'next/server';
import { messageDB } from '@/lib/friendship';

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, content, messageType = 'text' } = await request.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير متوفرة' },
        { status: 400 }
      );
    }

    const message = await messageDB.sendMessage(senderId, receiverId, content, messageType);
    
    if (!message) {
      return NextResponse.json(
        { error: 'فشل في إرسال الرسالة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user1Id = searchParams.get('user1Id');
    const user2Id = searchParams.get('user2Id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!user1Id || !user2Id) {
      return NextResponse.json(
        { error: 'معرفات المستخدمين مطلوبة' },
        { status: 400 }
      );
    }

    const messages = await messageDB.getConversation(user1Id, user2Id, limit);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
