<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource (Explore).
     */
    public function index(Request $request)
    {
        $articles = Article::with('user')
            ->where('status', 'published')
            ->withCount('views')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($articles);
    }

    /**
     * Display articles from users being followed.
     */
    public function following(Request $request)
    {
        $user = $request->user();
        
        // Get list of user IDs that the current user follows
        $followingIds = $user->followings()->pluck('users.id');

        $articles = Article::whereIn('user_id', $followingIds)
            ->where('status', 'published')
            ->with('user')
            ->withCount('views')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($articles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'nullable|string|in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $article = $request->user()->articles()->create([
            'title' => $request->title,
            'content' => $request->content,
            'excerpt' => $request->excerpt,
            'status' => $request->input('status', 'published'),
        ]);

        // Reload user relation
        $article->load('user');

        return response()->json($article, 201);
    }

    /**
     * Display the specified resource and log a view with a tracker.
     */
    public function show(Request $request, $slug)
    {
        $article = Article::where('slug', $slug)
            ->with('user')
            ->withCount('views')
            ->firstOrFail();

        // If the article is a draft, only the author is allowed to view it
        if ($article->status === 'draft') {
            $currentUser = auth('sanctum')->user();
            if (!$currentUser || $currentUser->id !== $article->user_id) {
                abort(404);
            }
        }

        // Track the view source if any
        $source = strtolower($request->query('source', 'direct'));
        
        // Sanitize source to prevent long garbage entries
        $allowedSources = ['x', 'linkedin', 'instagram', 'link', 'direct'];
        if (!in_array($source, $allowedSources)) {
            // Keep it if it's alphanumeric and short, otherwise default to direct
            if (preg_match('/^[a-z0-9_-]{1,20}$/', $source)) {
                // keep source
            } else {
                $source = 'direct';
            }
        }

        $ip = $request->ip();

        // Only count view if this IP hasn't viewed this article in the last hour
        $recentView = ArticleView::where('article_id', $article->id)
            ->where('ip_address', $ip)
            ->where('created_at', '>=', now()->subHours(1))
            ->exists();

        if (!$recentView) {
            ArticleView::create([
                'article_id' => $article->id,
                'source' => $source,
                'ip_address' => $ip,
            ]);
            
            // Refresh view count for response
            $article = Article::where('slug', $slug)
                ->with('user')
                ->withCount('views')
                ->first();
        }

        return response()->json($article);
    }

    /**
     * Upload an image file to local storage.
     */
    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            
            $uploadPath = public_path('uploads');
            if (!File::exists($uploadPath)) {
                File::makeDirectory($uploadPath, 0755, true);
            }

            $file->move($uploadPath, $filename);
            $url = asset('uploads/' . $filename);

            return response()->json(['url' => $url]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        // Check ownership
        if ($article->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|min:10',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'sometimes|required|string|in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $article->update($request->only([
            'title',
            'content',
            'excerpt',
            'status',
        ]));

        return response()->json($article);
    }
}
