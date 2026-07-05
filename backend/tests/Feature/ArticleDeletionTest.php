<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_soft_delete_article(): void
    {
        $owner = User::factory()->create(['username' => 'owneruser']);
        $article = Article::create([
            'user_id' => $owner->id,
            'title' => 'Article to Delete',
            'content' => 'This is some content for the article to delete.',
            'status' => 'published',
        ]);

        $response = $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Article deleted successfully']);

        // Assert the article was soft deleted (exists in DB with deleted_at set)
        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => 'Article to Delete',
        ]);
        $this->assertNotNull(Article::withTrashed()->find($article->id)->deleted_at);

        // Assert it is not returned in normal queries
        $this->assertNull(Article::find($article->id));
    }

    public function test_non_owner_cannot_delete_article(): void
    {
        $owner = User::factory()->create(['username' => 'owneruser']);
        $otherUser = User::factory()->create(['username' => 'otheruser']);

        $article = Article::create([
            'user_id' => $owner->id,
            'title' => 'Article to Delete',
            'content' => 'This is some content for the article to delete.',
            'status' => 'published',
        ]);

        $response = $this->actingAs($otherUser, 'sanctum')
            ->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(403);

        // Assert the article is NOT soft deleted
        $this->assertNull(Article::withTrashed()->find($article->id)->deleted_at);
        $this->assertNotNull(Article::find($article->id));
    }

    public function test_unauthenticated_user_cannot_delete_article(): void
    {
        $owner = User::factory()->create(['username' => 'owneruser']);
        $article = Article::create([
            'user_id' => $owner->id,
            'title' => 'Article to Delete',
            'content' => 'This is some content for the article to delete.',
            'status' => 'published',
        ]);

        $response = $this->deleteJson("/api/articles/{$article->id}");

        $response->assertStatus(401);

        // Assert the article is NOT soft deleted
        $this->assertNull(Article::withTrashed()->find($article->id)->deleted_at);
        $this->assertNotNull(Article::find($article->id));
    }
}
