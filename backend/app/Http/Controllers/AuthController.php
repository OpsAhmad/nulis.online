<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Get a new math equation challenge.
     */
    public function challenge()
    {
        $num1 = rand(1, 15);
        $num2 = rand(1, 15);
        $answer = $num1 + $num2;
        
        // Encrypt the answer and the current timestamp to make it stateless and limit lifespan
        $key = Crypt::encryptString($answer . '|' . time());
        
        return response()->json([
            'question' => "{$num1} + {$num2} = ?",
            'key' => $key,
        ]);
    }

    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|alpha_dash|min:3|max:30|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'challenge_answer' => 'required|string',
            'challenge_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify the math challenge
        if (!$this->verifyChallenge($request->challenge_key, $request->challenge_answer)) {
            return response()->json([
                'errors' => ['challenge_answer' => ['The robot challenge answer is incorrect or has expired.']]
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => strtolower($request->username),
            'password' => Hash::make($request->password),
            // Default blank bio/image/socials
            'description' => '',
            'image_path' => '',
            'social_x' => '',
            'social_linkedin' => '',
            'social_instagram' => '',
            'social_website' => '',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'challenge_answer' => 'required|string',
            'challenge_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify math challenge
        if (!$this->verifyChallenge($request->challenge_key, $request->challenge_answer)) {
            return response()->json([
                'errors' => ['challenge_answer' => ['The robot challenge answer is incorrect or has expired.']]
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'errors' => ['email' => ['Invalid email or password.']]
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Get current authenticated user details.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Helper to verify challenge.
     */
    private function verifyChallenge($key, $answer)
    {
        try {
            $decrypted = Crypt::decryptString($key);
            $parts = explode('|', $decrypted);
            
            if (count($parts) !== 2) {
                return false;
            }
            
            [$correctAnswer, $timestamp] = $parts;

            // Challenge expires in 10 minutes (600 seconds)
            if (time() - intval($timestamp) > 600) {
                return false;
            }

            return intval($correctAnswer) === intval($answer);
        } catch (\Exception $e) {
            return false;
        }
    }
}
