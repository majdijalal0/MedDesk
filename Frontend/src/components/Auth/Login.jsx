import { Lock, Eye,EyeOff, Mail } from 'lucide-react';
import { useState } from 'react';
import {login} from '../../services/authServices';
import { useAuthStore } from '../../store/authStore';


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email,setEmail]= useState('');
  const [password,setPassword] = useState('');

  const [error,setError] = useState('');
  const [validationErrors,setValidationErrors] = useState({});

  const setUser = useAuthStore((state) => state.setUser);


  const submitForm = async (e)=>{
    e.preventDefault();
    setValidationErrors({});

    let newErrors = {};
    if(!email || !password){
      newErrors.missingFields = "Vous avez des champs manquants";
    }
    if(password.length < 8){
      newErrors.password = "Vote mot de passe doit contenir au moins 8 caractères";
    }
    
    if(Object.keys(newErrors).length >0){
      setValidationErrors(newErrors)
      return;
    }

    const response = await login({email,password});
    if(response.error){
      setError(response.error)
    }else if (response.errors && Array.isArray(response.errors)){
      response.errors.forEach((error) => {
          newErrors[error.path] = error.msg;
      });
      setValidationErrors(newErrors)
    }else{
      setValidationErrors('')
      setError('')
      setUser(response.user)
      await useAuthStore.getState().initUserSession(response.user);
  
    }

  }


  

  return (
    <div className='mt-6 mx-4 md:mx-8 pb-8'>
      <form onSubmit={submitForm}>
        <div className='flex flex-col mb-6'>
          <label className='text-sm font-semibold text-gray-700 mb-2'>EMAIL</label>
          <div className='relative'>
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type='email' 
              placeholder="docteur@gmail.com"
              value={email}
              className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500' 
              onChange={(e)=>{setEmail(e.target.value)}}
            />
          </div>
        {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
        </div>

        <div className='flex flex-col mb-6'>
          <label className='text-sm font-semibold text-gray-700 mb-2'>MOT DE PASSE</label>
          <div className='relative'>
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={password}
              className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500'
              onChange={(e)=>{setPassword(e.target.value)}} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {validationErrors.password &&  <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
        </div>

      

        {validationErrors.missingFields && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">{validationErrors.missingFields}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">{error}</p>
        )}

        <button type='submit' className='w-full py-3 bg-teal-700 text-white font-semibold cursor-pointer rounded-lg hover:bg-teal-800 transition-colors shadow-sm'>
          Se connecter
        </button>
      </form>
    </div>
  )
}

export default Login;