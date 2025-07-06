import { sendFrameNotification } from "@/lib/notification-client";
import { CharmProfile, NotificationData } from "@/types/charm-caster";

interface NotificationService {
  sendMatchRequest(fromProfile: CharmProfile, toFid: number): Promise<void>;
  sendMatchConfirmed(fromProfile: CharmProfile, toFid: number, matchId: string): Promise<void>;
  sendNFTReady(fromProfile: CharmProfile, toFid: number, matchId: string): Promise<void>;
  sendNFTMinted(fromProfile: CharmProfile, toFid: number, matchId: string, tokenId: string): Promise<void>;
  createNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'read'>): Promise<NotificationData | null>;
}

class CharmCasterNotificationService implements NotificationService {
  private async sendNotificationToUser(
    fid: number,
    title: string,
    body: string,
    notificationData: Omit<NotificationData, 'id' | 'createdAt' | 'read'>
  ): Promise<void> {
    try {
      // Send push notification
      const result = await sendFrameNotification({
        fid,
        title,
        body
      });

      console.log(`Notification sent to ${fid}:`, result);

      // Store notification in database
      await this.createNotification(notificationData);
    } catch (error) {
      console.error(`Failed to send notification to ${fid}:`, error);
    }
  }

  async createNotification(
    notification: Omit<NotificationData, 'id' | 'createdAt' | 'read'>
  ): Promise<NotificationData | null> {
    try {
      const response = await fetch(`/api/notifications/${notification.toFid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async sendMatchRequest(fromProfile: CharmProfile, toFid: number): Promise<void> {
    const title = "💕 New Match Request!";
    const body = `${fromProfile.display_name} wants to connect with you on Charm Caster`;

    await this.sendNotificationToUser(
      toFid,
      title,
      body,
      {
        type: 'match_request',
        fromFid: fromProfile.fid,
        toFid,
        fromProfile,
        message: `${fromProfile.display_name} sent you a match request`
      }
    );
  }

  async sendMatchConfirmed(
    fromProfile: CharmProfile,
    toFid: number,
    matchId: string
  ): Promise<void> {
    const title = "🎉 It's a Match!";
    const body = `You and ${fromProfile.display_name} are now connected!`;

    await this.sendNotificationToUser(
      toFid,
      title,
      body,
      {
        type: 'match_confirmed',
        fromFid: fromProfile.fid,
        toFid,
        fromProfile,
        matchId,
        message: `You matched with ${fromProfile.display_name}!`
      }
    );
  }

  async sendNFTReady(
    fromProfile: CharmProfile,
    toFid: number,
    matchId: string
  ): Promise<void> {
    const title = "✨ NFT Ready to Mint!";
    const body = `Your connection with ${fromProfile.display_name} can now be immortalized as an NFT`;

    await this.sendNotificationToUser(
      toFid,
      title,
      body,
      {
        type: 'nft_ready',
        fromFid: fromProfile.fid,
        toFid,
        fromProfile,
        matchId,
        message: `Your match with ${fromProfile.display_name} is ready to mint as an NFT`
      }
    );
  }

  async sendNFTMinted(
    fromProfile: CharmProfile,
    toFid: number,
    matchId: string,
    tokenId: string
  ): Promise<void> {
    const title = "🏆 NFT Minted Successfully!";
    const body = `Your connection NFT with ${fromProfile.display_name} has been minted!`;

    await this.sendNotificationToUser(
      toFid,
      title,
      body,
      {
        type: 'nft_minted',
        fromFid: fromProfile.fid,
        toFid,
        fromProfile,
        matchId,
        message: `Your connection NFT with ${fromProfile.display_name} has been minted! Token ID: ${tokenId}`
      }
    );
  }
}

export const notificationService = new CharmCasterNotificationService();
