<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('user')->index();
            $table->string('currency', 3)->default('IDR');
            $table->unsignedSmallInteger('birth_year')->nullable();
            $table->decimal('monthly_income', 16, 2)->default(0);
            $table->string('occupation')->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_enabled_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role', 'currency', 'birth_year', 'monthly_income', 'occupation',
                'two_factor_secret', 'two_factor_recovery_codes',
                'two_factor_enabled_at', 'last_active_at',
            ]);
        });
    }
};
