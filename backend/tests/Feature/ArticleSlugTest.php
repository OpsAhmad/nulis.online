<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ArticleSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_slug_automatically_on_creation(): void
    {
        $user = User::factory()->create(['username' => 'testuser']);

        $article = Article::create([
            'user_id' => $user->id,
            'title' => 'My First Article',
            'content' => 'This is some long content for the article.',
            'status' => 'published',
        ]);

        $this->assertNotEmpty($article->slug);
        $this->assertTrue(Str::startsWith($article->slug, 'my-first-article-'));
    }

    public function test_updates_slug_when_title_is_updated(): void
    {
        $user = User::factory()->create(['username' => 'testuser']);

        $article = Article::create([
            'user_id' => $user->id,
            'title' => 'My First Article',
            'content' => 'This is some long content for the article.',
            'status' => 'published',
        ]);

        $originalSlug = $article->slug;

        // Update the title
        $article->update([
            'title' => 'Updated Article Title',
        ]);

        $this->assertNotEquals($originalSlug, $article->slug);
        $this->assertTrue(Str::startsWith($article->slug, 'updated-article-title-'));
    }

    public function test_does_not_update_slug_when_other_fields_are_updated(): void
    {
        $user = User::factory()->create(['username' => 'testuser']);

        $article = Article::create([
            'user_id' => $user->id,
            'title' => 'My First Article',
            'content' => 'This is some long content for the article.',
            'status' => 'published',
        ]);

        $originalSlug = $article->slug;

        // Update content and status only
        $article->update([
            'content' => 'New modified content that is also long.',
            'status' => 'draft',
        ]);

        $this->assertEquals($originalSlug, $article->slug);
    }
}
