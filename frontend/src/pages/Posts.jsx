import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ArrowRight } from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axiosClient.get('/api/posts');
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-primary">Bài viết</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post._id} className="bg-surface-dark rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
            {post.thumbnail && (
              <img src={post.thumbnail} alt={post.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-2 hover:text-primary transition-colors">
                <Link to={`/posts/${post.slug}`} className="block">{post.title}</Link>
              </h2>
              <p className="text-gray-400 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
              <Link to={`/posts/${post.slug}`} className="mt-4 inline-flex items-center text-primary hover:underline">
                Đọc thêm <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
