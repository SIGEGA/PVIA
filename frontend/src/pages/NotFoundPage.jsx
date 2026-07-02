import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
    <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
    <p className="text-gray-500 mb-6">La ruta que buscas no existe o fue movida.</p>
    <Link to="/dashboard">
      <Button>Ir al panel de control</Button>
    </Link>
  </div>
);

export default NotFoundPage;
