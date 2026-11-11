<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ClerkUserSynchronizer
{
    public function sync(string $clerkId): User
    {
        $secret = config('services.clerk.secret_key');
        abort_unless(is_string($secret) && $secret !== '', 503, 'Account synchronization is temporarily unavailable.');
        try {
            $response = Http::withToken($secret)->acceptJson()->connectTimeout(3)->timeout(5)
                ->get('https://api.clerk.com/v1/users/'.rawurlencode($clerkId));
        } catch (ConnectionException $exception) {
            abort(503, 'Account synchronization is temporarily unavailable.');
        }

        abort_if($response->notFound(), 401, 'Invalid session.');
        $profile = $response->json();
        abort_unless($response->successful() && is_array($profile)
            && ($profile['id'] ?? null) === $clerkId, 503, 'Account synchronization is temporarily unavailable.');

        $emails = $profile['email_addresses'] ?? [];
        abort_unless(is_array($emails), 503, 'Account synchronization is temporarily unavailable.');
        $primary = collect($emails)->first(fn ($email) => is_array($email)
            && is_string($profile['primary_email_address_id'] ?? null)
            && ($email['id'] ?? null) === $profile['primary_email_address_id']);
        $email = $primary['email_address'] ?? null;
        abort_if(Validator::make(['email' => $email], ['email' => 'required|string|email|max:255'])->fails(),
            422, 'Your account needs a primary email address.');

        $names = [$profile['first_name'] ?? null, $profile['last_name'] ?? null];
        $name = trim(implode(' ', array_filter($names, fn ($part) => is_string($part) && trim($part) !== '')));
        $attributes = [
            'clerk_id' => $clerkId,
            'name' => $name !== '' ? $name : 'StayApp user',
            'email' => $email,
            'first_name' => $profile['first_name'] ?? null,
            'last_name' => $profile['last_name'] ?? null,
            'profile_image_url' => $profile['image_url'] ?? null,
            'email_verified_at' => ($primary['verification']['status'] ?? null) === 'verified' ? now() : null,
        ];
        abort_if(Validator::make($attributes, [
            'name' => 'required|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'profile_image_url' => 'nullable|string|url:https|max:2048',
        ])->fails(), 422, 'Your account profile cannot be synchronized.');

        try {
            return DB::transaction(function () use ($attributes, $clerkId) {
                User::upsert([$attributes], ['clerk_id'], ['name', 'email', 'first_name', 'last_name', 'profile_image_url', 'email_verified_at']);

                return User::where('clerk_id', $clerkId)->firstOrFail();
            });
        } catch (UniqueConstraintViolationException $exception) {
            abort(409, 'This account could not be linked. Please contact support.');
        }
    }
}
