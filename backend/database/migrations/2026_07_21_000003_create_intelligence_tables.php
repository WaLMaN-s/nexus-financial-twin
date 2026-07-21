<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('decision_type', 40)->index(); // buy_vehicle | buy_house | buy_gadget | marriage | children | business | loan | invest_more
            $table->string('title');
            $table->jsonb('parameters');
            $table->jsonb('result');
            $table->timestamps();
        });

        Schema::create('behavior_insights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40)->index(); // impulsive_spender | conservative_saver | lifestyle_inflation | subscription_waste | overspending_trend
            $table->string('severity', 20)->default('info'); // info | warning | critical | positive
            $table->string('title');
            $table->text('body');
            $table->jsonb('data')->nullable();
            $table->timestamp('detected_at');
            $table->timestamps();
        });

        Schema::create('health_score_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->jsonb('components');
            $table->timestamp('computed_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_score_snapshots');
        Schema::dropIfExists('behavior_insights');
        Schema::dropIfExists('simulations');
    }
};
