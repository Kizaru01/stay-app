<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class SyncClerkUserController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $clerkId = $request->attributes->get('clerk_user_id');
        $secretKey = config('services.clerk.secret_key');
        abort_unless(is_string($secretKey) && $secretKey !== '', 503, 'Identity synchronization is unavailable.');

        try {
            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(8)
                ->withoutRedirecting()
                ->get('https://api.clerk.com/v1/users/'.rawurlencode($clerkId));
        } catch (ConnectionException) {
            abort(503, 'Identity synchronization is unavailable. Please try again.');
        }

        abort_if($response->status() === 404, 401, 'Unauthenticated.');
        abort_unless($response->successful(), 503, 'Identity synchronization is unavailable. Please try again.');

        $profile = $response->json();
        abort_unless(is_array($profile), 503, 'Identity synchronization is unavailable.');
        $validator = Validator::make($profile, [
            'id' => ['required', 'string', 'in:'.$clerkId],
            'first_name' => ['present', 'nullable', 'string', 'max:255'],
            'last_name' => ['present', 'nullable', 'string', 'max:255'],
            'image_url' => ['present', 'nullable', 'url:https', 'max:2048'],
            'primary_email_address_id' => ['present', 'nullable', 'string', 'max:255'],
            'email_addresses' => ['present', 'array'],
            'email_addresses.*' => ['array'],
            'email_addresses.*.id' => ['required', 'string', 'distinct', 'max:255'],
            'email_addresses.*.email_address' => ['required', 'email:rfc', 'max:255'],
        ]);
        abort_if($validator->fails(), 503, 'Identity synchronization is unavailable.');

        $profile = $validator->validated();
        $email = null;
        if ($profile['primary_email_address_id'] !== null) {
            $primaryEmail = collect($profile['email_addresses'])->firstWhere('id', $profile['primary_email_address_id']);
            abort_if($primaryEmail === null, 503, 'Identity synchronization is unavailable.');
            $email = $primaryEmail['email_address'];
        }

        $attributes = [
            'clerk_id' => $clerkId,
            'email' => $email,
            'first_name' => $profile['first_name'],
            'last_name' => $profile['last_name'],
            'profile_image_url' => $profile['image_url'],
            'name' => mb_substr(trim(($profile['first_name'] ?? '').' '.($profile['last_name'] ?? '')), 0, 255),
            'email_verified_at' => null,
        ];

        try {
            $user = DB::transaction(function () use ($attributes, $clerkId): User {
                User::query()->upsert([$attributes], ['clerk_id'], [
                    'email', 'first_name', 'last_name', 'profile_image_url', 'name', 'email_verified_at',
                ]);

                return User::query()->where('clerk_id', $clerkId)->firstOrFail();
            });
        } catch (UniqueConstraintViolationException) {
            return response()->json(['message' => 'This identity conflicts with an existing account. Contact support.'], 409);
        }

        return response()->json(['data' => $user->only([
            'id', 'clerk_id', 'email', 'first_name', 'last_name', 'profile_image_url',
        ])]);
    }
}
