import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axiosClient.get(`/api/posts/${slug}`);
        setPost(data);
      } catch (err) {
        setError('Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-8">Post not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-primary">{post.title}</h1>
      {post.thumbnail && (
        <img src={post.thumbnail} alt={post.title} className="w-full h-64 object-cover rounded mb-6" />
      )}
      <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostDetail;
