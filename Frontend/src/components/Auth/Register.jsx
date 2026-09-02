import { User, Mail, Lock } from 'lucide-react';
import {register} from '../../services/authServices';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const Register = () => {
  const[first_name,setFirstName] = useState('');
  const[last_name,setLastName] = useState('');
  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');
  const [confirmation,setConfirmation] = useState('');
  const [role,setRole] = useState('');

  const [error,setError] = useState('');
  const [validationErrors,setValidationErrors] = useState({});

  const setUser = useAuthStore((state) => state.setUser);

  const submitForm = async (e)=>{
    e.preventDefault();
    setValidationErrors({})
    
    let newErrors = {};

    if(!first_name || ! last_name || !email || ! email || ! password || !confirmation || !role) {
     newErrors.missingFields = "Vous avez des champs manquants"
    }

    if(password !== confirmation){
      newErrors.confirmPassword = "Les mots de passe sont différents";
    }

    if(password.length < 8){
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères , au moins une lettre majusucle , au moins un chiffre , au moins un caractère spécial"
    }


    
    if(Object.keys(newErrors).length>0){
      setValidationErrors(newErrors);
      return;
    }

    const response = await register({first_name,last_name,email,password,role});

    if(response.error){
      setError(response.error)
    }else if(response.errors && Array.isArray(response.errors)){
      response.errors.forEach((error)=>{
        newErrors[error.path] = error.msg;
      })
      setValidationErrors(newErrors)
    }else{
      setValidationErrors({});
      setError('');
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
  }
  return (
    <div className='mt-6 mx-4 md:mx-8 pb-8'>
      <form onSubmit={submitForm}>
        <div className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex flex-col w-full md:w-1/2'>
            <label className='text-sm font-semibold text-gray-700 mb-2'>PRÉNOM</label>
            <div className='relative'>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type='text' 
                placeholder="Prénom"
                value={first_name}
                className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500'
                onChange={(e)=>{setFirstName(e.target.value)}} 
              />
            </div>
          </div>


          <div className='flex flex-col w-full md:w-1/2'>
            <label className='text-sm font-semibold text-gray-700 mb-2'>NOM</label>
            <div className='relative'>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type='text' 
                placeholder="Nom"
                value={last_name}
                className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500'
                onChange={(e)=>{setLastName(e.target.value)}} 
              /> 
            </div>
            {validationErrors.first_name && <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>}
          </div>
        </div>

          

          <div className='flex flex-col w-full my-4'>
          <label className='text-sm font-semibold text-gray-700 mb-2'>EMAIL</label>
          <div className='relative'>
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type='email' 
              placeholder="Email "
              value={email}
              className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500'
              onChange={(e)=>{setEmail(e.target.value)}} 
 
            />
          </div>
            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}          
        </div>

          


        <div className='flex flex-col md:flex-row gap-4 mb-4'>
          <div className='flex flex-col w-full md:w-1/2'>
            <label className='text-sm font-semibold text-gray-700 mb-2'>MOT DE PASSE</label>
            <div className='relative'>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type='password' 
                placeholder="••••••••"
                value={password}
                className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500'
                onChange={(e)=>{setPassword(e.target.value)}} 

              />
            </div>
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </div>

          <div className='flex flex-col w-full md:w-1/2'>
            <label className='text-sm font-semibold text-gray-700 mb-2'>CONFIRMER</label>
            <div className='relative'>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type='password' 
                placeholder="••••••••"
                value={confirmation}
                className='border border-gray-300 rounded-lg w-full h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500' 
                onChange={(e)=>{setConfirmation(e.target.value)}} 

              />
            </div>
            {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
          </div>
        </div>
        
        <div className='flex flex-col mb-6'>
          <label className='text-sm font-semibold text-gray-700 mb-3'>RÔLE</label>
          <div className='flex gap-6'>
            <label className='flex items-center cursor-pointer'>
              <input 
                type="radio" 
                name="role" 
                value="médecin"
                checked={role === 'médecin'} 
                className='w-4 h-4 text-teal-700 bg-gray-100 border-gray-300 focus:ring-teal-500 accent-teal-700' 
                onChange={(e)=>{setRole(e.target.value)}}
              />
              <span className='ml-2 text-sm text-gray-700'>Médecin</span>
            </label>
            <label className='flex items-center cursor-pointer'>
              <input 
                type="radio" 
                name="role" 
                value="secrétaire" 
                checked={role === 'secrétaire'}
                className='w-4 h-4 text-teal-700 bg-gray-100 border-gray-300 focus:ring-teal-500 accent-teal-700'
                onChange={(e)=>{setRole(e.target.value)}}
              />
              <span className='ml-2 text-sm text-gray-700'>Secrétaire</span>
            </label>
          </div>
          {validationErrors.role && <p className="text-red-500 text-sm mb-4 text-center">{validationErrors.role}</p>}

        </div>

       {validationErrors.missingFields && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">{validationErrors.missingFields}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">{error}</p>
        )}

        <button type='submit' className='w-full py-3 bg-teal-700 text-white font-semibold cursor-pointer rounded-lg hover:bg-teal-800 transition-colors shadow-sm'>
          Créer un compte
        </button>
      </form>
    </div>
  )
}

export default Register;