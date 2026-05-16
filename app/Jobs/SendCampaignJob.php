<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\NewsletterSubscriber;
use App\Notifications\CampaignSendNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendCampaignJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $campaignId,
    ) {}

    public function uniqueId(): string
    {
        return (string) $this->campaignId;
    }

    public function handle(): void
    {
        $campaign = Campaign::with('promo')->findOrFail($this->campaignId);

        $campaign->update(['status' => 'sending']);

        $sent = 0;
        $failed = 0;

        NewsletterSubscriber::subscribed()->chunk(100, function ($subscribers) use ($campaign, &$sent, &$failed) {
            foreach ($subscribers as $subscriber) {
                try {
                    Notification::send($subscriber, new CampaignSendNotification(
                        subject: $campaign->subject,
                        emailBody: $campaign->email_body ?? '',
                        unsubscribeToken: $subscriber->unsubscribe_token,
                    ));

                    $subscriber->update(['last_promo_sent_at' => now()]);
                    $sent++;
                } catch (\Throwable $e) {
                    Log::error('Failed to send campaign email', [
                        'campaign_id' => $campaign->id,
                        'subscriber_id' => $subscriber->id,
                        'email' => $subscriber->email,
                        'error' => $e->getMessage(),
                    ]);
                    $failed++;
                }
            }
        });

        $campaign->update([
            'status' => 'sent',
            'sent_count' => $sent,
            'failed_count' => $failed,
            'sent_at' => now(),
        ]);
    }
}
