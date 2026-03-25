<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE password_setup_tokens MODIFY COLUMN type ENUM('setup', 'reset', 'verification') DEFAULT 'setup'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE password_setup_tokens MODIFY COLUMN type ENUM('setup', 'reset') DEFAULT 'setup'");
    }
};
