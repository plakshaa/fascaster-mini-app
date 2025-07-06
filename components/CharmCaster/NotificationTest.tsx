// Test component to manually trigger notifications for testing
"use client";

export const NotificationTest = ({ currentUserFid }: { currentUserFid?: number }) => {
  if (!currentUserFid) return null;

  const sendTestNotification = async () => {
    try {
      const response = await fetch(`/api/notifications/${currentUserFid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'match_request',
          fromFid: 99999,
          fromProfile: {
            fid: 99999,
            username: 'test_user',
            display_name: 'Test User',
            pfp_url: '/images/icon.png',
            follower_count: 100,
            following_count: 50
          },
          message: 'Test notification message!'
        })
      });
      
      if (response.ok) {
        console.log('Test notification sent successfully');
      } else {
        console.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const sendTestMatchRequest = async () => {
    try {
      const response = await fetch(`/api/match-requests/${currentUserFid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromFid: 88888,
          fromProfile: {
            fid: 88888,
            username: 'test_requester',
            display_name: 'Test Requester',
            pfp_url: '/images/icon.png',
            follower_count: 200,
            following_count: 100
          }
        })
      });
      
      if (response.ok) {
        console.log('Test match request sent successfully');
      } else {
        console.error('Failed to send test match request');
      }
    } catch (error) {
      console.error('Error sending test match request:', error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg space-y-2">
      <h3 className="text-sm font-bold">Debug Tools</h3>
      <button
        onClick={sendTestNotification}
        className="block w-full text-xs bg-blue-600 px-2 py-1 rounded"
      >
        Send Test Notification
      </button>
      <button
        onClick={sendTestMatchRequest}
        className="block w-full text-xs bg-green-600 px-2 py-1 rounded"
      >
        Send Test Match Request
      </button>
    </div>
  );
};
