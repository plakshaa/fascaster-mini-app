import { NextRequest, NextResponse } from "next/server";
import { NotificationData } from "@/types/charm-caster";
import { redis } from "@/lib/redis";

function getNotificationsKey(fid: number): string {
  return `charm:notifications:${fid}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    
    if (!fid || isNaN(fid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.warn("Redis not available, returning empty notifications");
      return NextResponse.json([]);
    }

    // Get all notifications for this user
    const notificationsJson = await redis.get(getNotificationsKey(fid));
    const notifications: NotificationData[] = (notificationsJson as NotificationData[]) || [];

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    
    if (!fid || isNaN(fid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    const notification: Partial<NotificationData> = await request.json();

    if (!notification.type || !notification.fromFid || !notification.message) {
      return NextResponse.json(
        { error: "Missing required notification fields" },
        { status: 400 }
      );
    }

    const newNotification: NotificationData = {
      id: crypto.randomUUID(),
      toFid: fid,
      createdAt: new Date(),
      read: false,
      ...notification
    } as NotificationData;

    if (!redis) {
      console.warn("Redis not available, notification not stored");
      return NextResponse.json(newNotification);
    }

    // Get existing notifications
    const existingNotifications: NotificationData[] = 
      ((await redis.get(getNotificationsKey(fid))) as NotificationData[]) || [];

    // Add new notification
    existingNotifications.unshift(newNotification);

    // Keep only the latest 50 notifications
    const trimmedNotifications = existingNotifications.slice(0, 50);

    // Store back to Redis
    await redis.set(getNotificationsKey(fid), trimmedNotifications);

    return NextResponse.json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    
    if (!fid || isNaN(fid)) {
      return NextResponse.json(
        { error: "Invalid FID" },
        { status: 400 }
      );
    }

    const { notificationId, read } = await request.json();

    if (!notificationId || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: "Missing notificationId or read status" },
        { status: 400 }
      );
    }

    if (!redis) {
      console.warn("Redis not available, notification not updated");
      return NextResponse.json({ success: false });
    }

    // Get existing notifications
    const notifications: NotificationData[] = 
      ((await redis.get(getNotificationsKey(fid))) as NotificationData[]) || [];

    // Update the specific notification
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read } : notif
    );

    // Store back to Redis
    await redis.set(getNotificationsKey(fid), updatedNotifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
