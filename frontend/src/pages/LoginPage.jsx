import LoginForm from '../features/auth/LoginForm';

const LoginPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
    {/* Círculos decorativos de fondo */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
    </div>

    <div className="w-full max-w-sm relative">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-900/50">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">ITH Sistemas</h1>
        <p className="text-blue-300/80 text-sm mt-1">Punto de Venta</p>
      </div>

      {/* Card del formulario */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 p-7 ring-1 ring-white/20">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
        <p className="text-sm text-gray-400 mb-6">Ingresa tus credenciales para continuar</p>
        <LoginForm />
      </div>

      <p className="text-center text-slate-500/60 text-xs mt-6">
        © 2025 Instituto Tecnológico de Hermosillo
      </p>
    </div>
  </div>
);

export default LoginPage;
