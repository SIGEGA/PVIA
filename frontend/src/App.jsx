import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/Toast';

const App = () => (
  <BrowserRouter>
    <AppRouter />
    <ToastContainer />
  </BrowserRouter>
);

export default App;
