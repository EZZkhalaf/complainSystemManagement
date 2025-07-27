import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden relative">

      {/* Sidebar */}
      <motion.div
        key={isLogin ? 'left' : 'right'}
        initial={{ x: isLogin ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isLogin ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className={`hidden md:flex md:w-1/3 bg-gradient-to-b from-cyan-500 to-cyan-600 p-10 items-center justify-center 
          ${isLogin ? 'md:order-first' : 'md:order-last'}`}
      >
        <h1 className="text-white text-4xl font-bold text-center leading-snug">
          Employee Management System
        </h1>
      </motion.div>

      {/* Form */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-16">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 md:p-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
