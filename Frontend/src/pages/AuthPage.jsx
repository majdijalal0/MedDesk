import { useState } from 'react';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center relative py-10 px-4"> 
      
      <h1 className="mt-10 md:mt-20 text-4xl md:text-6xl font-bold text-gray-800">MedDesk</h1>
      <h2 className="mt-4 text-base md:text-lg text-gray-600 tracking-wide text-center">Votre assistant médical intelligent</h2>
      
      <div className="h-[2px] w-[100px] bg-teal-700 my-4 rounded"></div>
      
      <p className="text-sm text-gray-500 mb-8 text-center">CHU | SYSTÈME DE DOSSIERS MÉDICAUX</p>

      <div className="relative bg-white border border-gray-300 w-full max-w-[600px] flex flex-col rounded-2xl shadow-lg">
        <div className='flex items-center mt-8 ml-4 md:ml-8 pb-4 border-b border-gray-200'>
          <p className="ml-3 text-lg font-semibold text-gray-800">ACCÈS AU SYSTÈME</p>
        </div>
        
        <div className="relative flex w-[90%] max-w-sm mx-auto bg-gray-100 rounded-full p-1 mt-6 mb-8">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-teal-700 rounded-full shadow-sm transition-all duration-300 ease-in-out ${
              isLogin ? 'left-1' : 'left-[calc(50%+0.25rem)]'
            }`}
          />

          <button
            onClick={() => setIsLogin(true)}
            className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
              isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connexion
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
              !isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inscription
          </button>
        </div>

        {isLogin ? <Login /> : <Register />}
        
        <div className="border-t border-gray-200 mx-4 md:mx-8 pb-6">
          <p className="text-center text-xs text-gray-500 mt-4">ACCÈS RÉSERVÉ AU PERSONNEL AUTORISÉ</p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage