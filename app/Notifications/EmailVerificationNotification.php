<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $verificationUrl,
        private string $username
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify Your Email - SavirBlossom')
            ->greeting("Hi {$this->username},")
            ->line('Welcome to SavirBlossom! Please verify your email address.')
            ->action('Verify Email', $this->verificationUrl)
            ->line('This link expires in 24 hours.')
            ->line('If you didn\'t create an account, please ignore this email.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'verification_url' => $this->verificationUrl,
        ];
    }
}
