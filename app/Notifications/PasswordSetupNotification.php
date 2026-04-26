<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordSetupNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $setupUrl,
        private string $username
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Set Up Your Password - SavirBlossom')
            ->greeting("Hi {$this->username},")
            ->line('Welcome to SavirBlossom! Your account has been created by our admin.')
            ->line('Click the button below to set up your password:')
            ->action('Set Up Password', $this->setupUrl)
            ->line('This link expires in 24 hours.')
            ->line('If you didn\'t expect this email, please ignore it.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'setup_url' => $this->setupUrl,
        ];
    }
}
