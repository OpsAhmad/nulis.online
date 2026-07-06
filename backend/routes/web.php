<?php

use Illuminate\Support\Facades\Route;
use App\Models\Article;
use Illuminate\Support\Str;

Route::get('{any}', function ($any = null) {
    // 1. Determine if we are on an article route
    $slug = null;
    if (preg_match('/^article\/([a-zA-Z0-9_-]+)$/', $any, $matches)) {
        $slug = $matches[1];
    }

    // 2. Locate the built React article.html or index.html
    $filename = $slug ? 'article.html' : 'index.html';
    $path = public_path("../frontend/dist/{$filename}");
    if (!file_exists($path)) {
        $path = base_path("../frontend/dist/{$filename}");
    }

    if (!file_exists($path)) {
        // Fallback to index.html if article.html is not found
        $fallbackFilename = 'index.html';
        $path = public_path("../frontend/dist/{$fallbackFilename}");
        if (!file_exists($path)) {
            $path = base_path("../frontend/dist/{$fallbackFilename}");
        }
    }

    if (!file_exists($path)) {
        // Fallback to default welcome if frontend build is not found
        return view('welcome');
    }

    $html = file_get_contents($path);

    // 3. If it's an article page, retrieve data and inject dynamic meta tags
    if ($slug) {
        $article = Article::with('user')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if ($article) {
            $title = e($article->title) . ' - Nulis.online';
            $desc = e($article->excerpt ?? Str::limit(strip_tags($article->content), 160));
            $author = e($article->user ? $article->user->name : 'Nulis Writer');

            // Find first image in content if any
            $imageUrl = '';
            if (preg_match('/<img[^>]+src="([^">]+)"/', $article->content, $imgMatches)) {
                $imageUrl = e($imgMatches[1]);
            } else {
                $imageUrl = asset('og-image.png');
            }

            // Replace standard title and primary meta tags
            $html = preg_replace('/<title>.*?<\/title>/is', "<title>{$title}</title>", $html);
            $html = preg_replace('/<meta name="title" content=".*?"\s*\/?>/is', "<meta name=\"title\" content=\"{$title}\" />", $html);
            $html = preg_replace('/<meta name="description" content=".*?"\s*\/?>/is', "<meta name=\"description\" content=\"{$desc}\" />", $html);
            $html = preg_replace('/<meta name="author" content=".*?"\s*\/?>/is', "<meta name=\"author\" content=\"{$author}\" />", $html);

            // Replace / Inject Open Graph tags
            $html = preg_replace('/<meta property="og:title" content=".*?"\s*\/?>/is', "<meta property=\"og:title\" content=\"{$article->title}\" />", $html);
            $html = preg_replace('/<meta property="og:description" content=".*?"\s*\/?>/is', "<meta property=\"og:description\" content=\"{$desc}\" />", $html);
            $html = preg_replace('/<meta property="og:url" content=".*?"\s*\/?>/is', "<meta property=\"og:url\" content=\"" . url()->current() . "\" />", $html);
            $html = preg_replace('/<meta property="og:image" content=".*?"\s*\/?>/is', "<meta property=\"og:image\" content=\"{$imageUrl}\" />", $html);

            // Replace / Inject Twitter tags
            $html = preg_replace('/<meta property="twitter:title" content=".*?"\s*\/?>/is', "<meta property=\"twitter:title\" content=\"{$article->title}\" />", $html);
            $html = preg_replace('/<meta property="twitter:description" content=".*?"\s*\/?>/is', "<meta property=\"twitter:description\" content=\"{$desc}\" />", $html);
            $html = preg_replace('/<meta property="twitter:image" content=".*?"\s*\/?>/is', "<meta property=\"twitter:image\" content=\"{$imageUrl}\" />", $html);
        }
    }

    return response($html)->header('Content-Type', 'text/html');
})->where('any', '.*');
