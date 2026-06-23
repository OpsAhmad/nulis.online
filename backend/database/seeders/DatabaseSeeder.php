<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleView;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create seeded users with bios fitting the monochrome architectural theme
        $dieter = User::create([
            'name' => 'Dieter Rams',
            'email' => 'dieter@rams.com',
            'username' => 'dieter',
            'password' => Hash::make('password123'),
            'description' => 'Good design is as little design as possible. Industrial designer, functionalist theorist, and former design director of Braun. I write about grids, systems, and functionality.',
            'image_path' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
            'social_x' => '@dieter_rams',
            'social_linkedin' => 'dieter-rams-braun',
            'social_instagram' => '@dieterrams',
            'social_website' => 'vitsoe.com',
        ]);

        $ando = User::create([
            'name' => 'Tadao Ando',
            'email' => 'ando@tadao.com',
            'username' => 'ando',
            'password' => Hash::make('password123'),
            'description' => 'Self-taught Japanese architect. Known for raw concrete walls, strict geometric layout plans, and structural play with natural light and empty whitespace.',
            'image_path' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
            'social_x' => '@tadao_ando',
            'social_linkedin' => 'tadao-ando-architecture',
            'social_website' => 'tadaoando.jp',
        ]);

        $yohji = User::create([
            'name' => 'Yohji Yamamoto',
            'email' => 'yohji@yamamoto.com',
            'username' => 'yohji',
            'password' => Hash::make('password123'),
            'description' => 'Monochrome fashion designer. I design silhouettes using heavy black fabric, draped folds, asymmetrical grids, and strict breathing room.',
            'image_path' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            'social_x' => '@yohji_official',
            'social_instagram' => '@yohjiyamamotoofficial',
            'social_website' => 'yohjiyamamoto.co.jp',
        ]);

        // 2. Set up follows between seed authors
        // Dieter follows Tadao and Yohji
        $dieter->followings()->attach([$ando->id, $yohji->id]);
        // Tadao follows Dieter
        $ando->followings()->attach([$dieter->id]);
        // Yohji follows Tadao
        $yohji->followings()->attach([$ando->id]);

        // 3. Create articles
        $article1 = Article::create([
            'user_id' => $dieter->id,
            'title' => 'Ten Principles for Good Writing',
            'slug' => 'ten-principles-for-good-writing',
            'excerpt' => 'Applying the classic Braun design philosophy to the craft of written communication. How to write with restraint, utility, and absolute clarity.',
            'content' => "Good design is as little design as possible. But what about writing? Can we apply functionalist principles to the way we assemble words?\n\n1. Good writing is honest.\nIt does not make the content look more significant or complex than it actually is. It does not try to manipulate the reader with cheap adjectives or hyperbole.\n\n2. Good writing makes a piece useful.\nEvery sentence must serve a functional purpose. If a paragraph does not support the core thesis or clarify a detail, it should be deleted. Design is utility; writing is utility.\n\n3. Good writing is unobtrusive.\nWriting is not a performance. It is a container for thoughts. The author's ego should recede, leaving a clean, quiet canvas. The reader should notice the ideas, not the vocabulary.\n\n4. Good writing is long-lasting.\nAvoid slang and temporary jargon. Use language that remains readable years from now, anchored on clear principles rather than seasonal trends.\n\n5. Good writing is thorough down to the last detail.\nCare for your punctuation, margins, and rhythm. A misplaced comma is like a loose screw on a radio board.\n\nTo write is to edit. Keep it simple, functional, and quiet.",
        ]);

        $article2 = Article::create([
            'user_id' => $ando->id,
            'title' => 'Concrete, Margins, and Silence',
            'slug' => 'concrete-margins-and-silence',
            'excerpt' => 'Reflections on architectural grids, raw concrete walls, and why physical whitespace is the most important element of any layout.',
            'content' => "In my architectural work, I focus on the interplay of raw concrete, geometric grids, and light. But I have realized that the most powerful element in any building is not the concrete itself. It is the void. It is the empty space.\n\nWhen we build a wall, we create a boundary. But we also define the space inside it. If we crowd a room with decorations, we lose the sense of space. The silence disappears.\n\nThis website, nulis.online, operates on the same architectural principles. It is a monochrome canvas. It values horizontal rules and strict grids. The borders are thin and clean. The margins are wide.\n\nWhen you write, do not fear the empty lines. Do not fear the whitespace. Give your sentences breathing room. The silence on the page allows the reader to think, to reflect, and to exist in a quiet state.\n\nArchitecture is not just visual; it is spatial. Writing is spatial too. Keep your layouts clean, your margins wide, and let the white canvas speak.",
        ]);

        $article3 = Article::create([
            'user_id' => $yohji->id,
            'title' => 'The Dignity of Black: Margins and Monochromatic Canvas',
            'slug' => 'the-dignity-of-black-margins-and-monochromatic-canvas',
            'excerpt' => 'Exploring the aesthetics of monochrome color schemes, strict lines, and why black is the most honest, quiet container for ideas.',
            'content' => "Black is modest and arrogant at the same time. Black is lazy and easy - but mysterious. But above all, black says this: \"I don't bother you - don't bother me.\"\n\nFor decades, I have designed clothing using black fabric. Black does not distract. It draws attention to the shape, the silhouette, and the way the fabric drapes over space. When you wear black, you are saying that your ideas, your personality, and your physical shape are what matter.\n\nWhen we write on a white canvas, the jet-black letters serve as our fabric. They outline our thoughts. If we inject colors—red, blue, green—we distract from the core structure. We add noise.\n\nA strict monochrome scale (#ffffff backgrounds, #000000 headings, and zinc-black #18181b body copy) creates a state of concentration. It is a quiet discipline.\n\nLet the black ink define the layout. Let the thin zinc lines create the boundaries. Restraint is not the absence of energy; it is the concentration of power.",
        ]);

        // 4. Seed traffic views with different sources for analytical tracking
        // Dieter's article views
        $this->seedViewsForArticle($article1->id, [
            'direct' => 45,
            'x' => 120,
            'linkedin' => 88,
            'instagram' => 12,
            'link' => 34
        ]);

        // Ando's article views
        $this->seedViewsForArticle($article2->id, [
            'direct' => 20,
            'x' => 40,
            'linkedin' => 112,
            'instagram' => 8,
            'link' => 25
        ]);

        // Yohji's article views
        $this->seedViewsForArticle($article3->id, [
            'direct' => 50,
            'x' => 180,
            'linkedin' => 45,
            'instagram' => 67,
            'link' => 95
        ]);
    }

    /**
     * Helper to seed views
     */
    private function seedViewsForArticle($articleId, $breakdown)
    {
        foreach ($breakdown as $source => $count) {
            for ($i = 0; $i < $count; $i++) {
                ArticleView::create([
                    'article_id' => $articleId,
                    'source' => $source,
                    'ip_address' => '192.168.1.' . rand(1, 254),
                    // Distribute views over the last 7 days
                    'created_at' => now()->subMinutes(rand(0, 10080)),
                ]);
            }
        }
    }
}
