<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignSendNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $subject,
        private string $emailBody,
        private string $unsubscribeToken,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('APP_FRONTEND_URL', 'http://localhost:5173'));
        $unsubscribeUrl = $frontendUrl.'/newsletter/unsubscribe?token='.$this->unsubscribeToken;

        return (new MailMessage)
            ->subject($this->subject)
            ->line($this->emailBody)
            ->line('—')
            ->line('If you no longer wish to receive these emails,')
            ->action('Unsubscribe', $unsubscribeUrl);
    }
}
