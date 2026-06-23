<?php

namespace App\Http\Controllers;

use App\Models\ArticleView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display the specified user profile.
     */
    public function show(Request $request, $username)
    {
        $user = User::withCount(['followers', 'followings'])
            ->where('username', $username)
            ->firstOrFail();

        // Check if currently authenticated user is following this user
        $isFollowing = false;
        $currentUser = auth('sanctum')->user();
        if ($currentUser) {
            $isFollowing = $user->followers()->where('follower_id', $currentUser->id)->exists();
        }

        // Get user's articles with view counts
        $articles = $user->articles()
            ->withCount('views')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => $user,
            'is_following' => $isFollowing,
            'articles' => $articles,
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_path' => 'nullable|string|max:2048', // Can be URL or Base64
            'social_x' => 'nullable|string|max:255',
            'social_linkedin' => 'nullable|string|max:255',
            'social_instagram' => 'nullable|string|max:255',
            'social_website' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only([
            'name',
            'description',
            'image_path',
            'social_x',
            'social_linkedin',
            'social_instagram',
            'social_website',
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Follow/unfollow a user.
     */
    public function follow(Request $request, $id)
    {
        $currentUser = $request->user();
        
        // Cannot follow yourself
        if ($currentUser->id === intval($id)) {
            return response()->json([
                'message' => 'You cannot follow yourself.'
            ], 400);
        }

        $userToFollow = User::findOrFail($id);

        // Toggle follow
        $results = $currentUser->followings()->toggle($userToFollow->id);
        $isFollowing = count($results['attached']) > 0;

        return response()->json([
            'is_following' => $isFollowing,
            'message' => $isFollowing ? 'You are now following this user.' : 'You have unfollowed this user.',
        ]);
    }

    /**
     * Get analytics for the logged-in user's articles.
     */
    public function analytics(Request $request)
    {
        $user = $request->user();
        $articleIds = $user->articles()->pluck('id');

        // 1. Total views
        $totalViews = ArticleView::whereIn('article_id', $articleIds)->count();

        // 2. Views by traffic source (overall)
        $sourceBreakdownRaw = ArticleView::whereIn('article_id', $articleIds)
            ->selectRaw('source, count(*) as count')
            ->groupBy('source')
            ->get();

        // Structure source breakdown cleanly
        $sourceBreakdown = [
            'direct' => 0,
            'x' => 0,
            'linkedin' => 0,
            'instagram' => 0,
            'link' => 0,
        ];
        
        foreach ($sourceBreakdownRaw as $item) {
            $sourceBreakdown[$item->source] = $item->count;
        }

        // 3. Per-article performance
        $articles = $user->articles()
            ->withCount('views')
            ->with(['views' => function ($query) {
                $query->select('article_id', 'source');
            }])
            ->get()
            ->map(function ($article) {
                // Group views by source for this specific article
                $breakdown = [
                    'direct' => 0,
                    'x' => 0,
                    'linkedin' => 0,
                    'instagram' => 0,
                    'link' => 0,
                ];

                foreach ($article->views as $view) {
                    if (isset($breakdown[$view->source])) {
                        $breakdown[$view->source]++;
                    }
                }

                // Remove full views relation to keep payload compact
                unset($article->views);

                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'views_count' => $article->views_count,
                    'source_breakdown' => $breakdown,
                    'created_at' => $article->created_at,
                ];
            })
            ->sortByDesc('views_count')
            ->values();

        return response()->json([
            'total_views' => $totalViews,
            'source_breakdown' => $sourceBreakdown,
            'articles' => $articles,
        ]);
    }
}
