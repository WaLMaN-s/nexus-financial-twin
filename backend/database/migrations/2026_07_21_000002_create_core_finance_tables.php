<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 30)->index(); // cash | savings | investment | loan | credit_card
            $table->decimal('balance', 16, 2)->default(0);
            $table->decimal('interest_rate', 6, 3)->nullable(); // annual %, positive for growth, loans use APR
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type', 10)->index(); // income | expense
            $table->string('category', 40)->index();
            $table->string('description')->nullable();
            $table->decimal('amount', 16, 2);
            $table->date('occurred_at')->index();
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
            $table->index(['user_id', 'type', 'occurred_at']);
        });

        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 30)->index(); // house | car | wedding | emergency_fund | vacation | investment | custom
            $table->string('icon', 40)->nullable();
            $table->decimal('target_amount', 16, 2);
            $table->decimal('current_amount', 16, 2)->default(0);
            $table->decimal('monthly_contribution', 16, 2)->default(0);
            $table->date('target_date');
            $table->string('status', 20)->default('active')->index(); // active | achieved | paused
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category', 40)->nullable();
            $table->decimal('amount', 16, 2);
            $table->string('billing_cycle', 10)->default('monthly'); // monthly | yearly
            $table->timestamp('last_used_at')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('goals');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('accounts');
    }
};
