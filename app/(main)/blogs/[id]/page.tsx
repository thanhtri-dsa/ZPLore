'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Tags, BookOpen, Info } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { BlogPost } from '@/types/blogs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import Image from 'next/image';

// Skeleton Component for Loading State
const BlogPostSkeleton = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-4xl mx-auto">
      <div className="animate-pulse">
        {/* Title Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        
        {/* Metadata Skeleton */}
        <div className="flex space-x-4 mb-6">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* Image Skeleton */}
        <div className="h-96 bg-gray-200 rounded mb-6"></div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Related Blog Card Component
const RelatedBlogCard = ({ blog }: { blog: BlogPost }) => (
  <Link 
    href={`/blogs/${blog.id}`} 
    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
  >
    {blog.imageData && (
      <div className="relative pt-[56.25%] overflow-hidden rounded-t-lg"> {/* 16:9 Aspect Ratio */}
        <Image 
          src={blog.imageData} 
          alt={blog.title} 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...(blog.imageData.startsWith('data:') ? { unoptimized: true } : {})}
        />
      </div>
    )}
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
        {blog.title}
      </h3>
      <div className="flex items-center text-gray-600 text-sm">
        <User className="w-4 h-4 mr-2" />
        <span className="truncate">{blog.authorName}</span>
      </div>
    </div>
  </Link>
);

export default function EnhancedBlogPostPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizeTags = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value.map(String).map((t) => t.trim()).filter(Boolean)
      }
      if (typeof value === 'string') {
        return value.split(',').map((t) => t.trim()).filter(Boolean)
      }
      return []
    }

    setIsClient(true);
    
    const fetchBlogData = async () => {
      try {
        // Fetch main blog post
        const blogResponse = await fetch(`/api/blogs/${params.id}`);
        if (!blogResponse.ok) {
          throw new Error('Blog post not found');
        }
        const blogData = (await blogResponse.json()) as BlogPost & { tags?: unknown }
        blogData.tags = normalizeTags(blogData.tags)
        setBlog(blogData)

        // Fetch all blogs for related and recent
        const allBlogsResponse = await fetch('/api/blogs');
        if (!allBlogsResponse.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const allBlogsRaw = (await allBlogsResponse.json()) as Array<BlogPost & { tags?: unknown }>
        const allBlogs: BlogPost[] = allBlogsRaw.map((b) => ({ ...b, tags: normalizeTags(b.tags) }))

        // Find related blogs (same tags or same author)
        const related = allBlogs
          .filter((b: BlogPost) => 
            b.id !== blogData.id && 
            (b.authorName === blogData.authorName || 
             b.tags.some((tag: string) => blogData.tags.includes(tag)))
          )
          .slice(0, 3);
        setRelatedBlogs(related);

        // Find most recent blogs, excluding current blog and related blogs
        const recentExcludedIds = new Set([
          blogData.id, 
          ...related.map((b: BlogPost) => b.id)
        ]);

        const recent = allBlogs
          .filter((b: BlogPost) => !recentExcludedIds.has(b.id))
          .sort((a: BlogPost, b: BlogPost) => 
            parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
          )
          .slice(0, 4);
        setRecentBlogs(recent);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchBlogData();
  }, [params.id]);

  // Prevent hydration mismatch
  if (!isClient) {
    return <BlogPostSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-8 rounded-lg max-w-2xl mx-auto">
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return <BlogPostSkeleton />;
  }

  // Render method for Recent Blogs section
  const renderRecentBlogs = () => {
    if (recentBlogs.length === 0) {
      return (
        <Alert variant="default">
          <Info className="h-4 w-4" />
          <AlertTitle>No Recent Blogs</AlertTitle>
          <AlertDescription>
            Currently, there are no recent blog posts available.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {recentBlogs.map(recentBlog => (
          <RelatedBlogCard 
            key={recentBlog.id} 
            blog={recentBlog} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Blog Content */}
        <div className="lg:col-span-2">
          <Link
            href="/blogs"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{blog.authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{format(new Date(blog.createdAt), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {blog.imageData && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md">
              <Image
                src={blog.imageData}
                alt={blog.title}
                className="w-full h-auto object-cover"
                width={1200}  // Added width
                height={600}  // Added height
                {...(blog.imageData.startsWith('data:') 
                  ? { unoptimized: true } 
                  : {})}
              />
            </div>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Tags className="w-5 h-5 text-green-600" />
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>

          {/* Related Blogs Section (Mobile and Tablet) */}
          {relatedBlogs.length > 0 && (
            <div className="lg:hidden mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-green-600" />
                Related Blogs
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedBlogs.map(relatedBlog => (
                  <RelatedBlogCard 
                    key={relatedBlog.id} 
                    blog={relatedBlog} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with Recent Blogs */}
        <div className="lg:col-span-1 hidden lg:block ">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-green-600" />
            Recent Blogs
          </h2>
          {renderRecentBlogs()}

          {/* Related Blogs Section for Desktop */}
          {relatedBlogs.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-green-600" />
                Related Blogs
              </h2>
              <div className="space-y-4 ">
                {relatedBlogs.map(relatedBlog => (
                  <RelatedBlogCard 
                    key={relatedBlog.id} 
                    blog={relatedBlog} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
