'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { BlogPost } from '@/types/blogs';
import { safeImageSrc } from '@/lib/image';

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const router = useRouter();
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const tagsValue = (blog as unknown as { tags?: unknown }).tags
  const tags =
    Array.isArray(tagsValue)
      ? tagsValue.map(String).map((t) => t.trim()).filter(Boolean)
      : typeof tagsValue === 'string'
        ? tagsValue.split(',').map((t) => t.trim()).filter(Boolean)
        : []
  const imageSrc = safeImageSrc(blog.imageData, '/placeholder.svg?height=320&width=400')

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-green-100">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
          <div className="w-full sm:w-48 flex-shrink-0">
            <div className="relative w-full aspect-video sm:aspect-square rounded-lg overflow-hidden">
              <Image
                src={imageSrc}
                alt={blog.title}
                fill
                className="object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2 text-sm">
              <span className="flex items-center text-green-600">
                <Calendar className="w-4 h-4 mr-1" />
                {formattedDate}
              </span>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300 line-clamp-2">
              {blog.title}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-4">
              {blog.content}
            </p>

            <button
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="inline-flex items-center text-base sm:text-lg font-semibold text-green-700 hover:text-green-900 transition-colors duration-300"
            >
              <span className="mr-2">Read Article</span>
              <ArrowUpRight className="w-5 h-5 group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
