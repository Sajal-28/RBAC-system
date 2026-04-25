import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center p-4 bg-slate-200 rounded-2xl mb-6">
          <FileQuestion className="text-slate-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">404 Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
