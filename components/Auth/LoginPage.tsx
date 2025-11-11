import React, { useState } from 'react';
import { User } from '../../types';
import { login, register } from '../../services/mockApi';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration-specific state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const user = await login(email, password);
    setIsLoading(false);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password. Try patient@nexsched.com or admin@nexsched.com');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setError('');
    setIsLoading(true);
    
    const result = await register({
        name,
        email,
        password_reg: password,
        phone,
        age: parseInt(age, 10),
        gender
    });
    
    setIsLoading(false);

    if (result.user) {
        onLogin(result.user);
    } else {
        setError(result.error || 'An unknown error occurred during registration.');
    }
  }
  
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
  };

  const renderLoginForm = () => (
    <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleLoginSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email-address-login" className="sr-only">Email address</label>
          <input
            id="email-address-login"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password-login" className="sr-only">Password</label>
          <input
            id="password-login"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-blue focus:border-brand-blue focus:z-10 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-brand-gray-dark"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
      <div className="text-center text-sm">
          <button type="button" onClick={toggleForm} className="font-medium text-brand-blue hover:text-brand-blue-dark">
              Don't have an account? Sign Up
          </button>
      </div>
      <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Patient Demo: patient@nexsched.com / password123</p>
          <p>Admin Demo: admin@nexsched.com / admin123</p>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
     <form className="mt-8 space-y-4 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleRegisterSubmit}>
        <div className="grid grid-cols-1 gap-y-4">
            <input name="name" type="text" required className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input name="email" type="email" required className="input-field" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
            <input name="phone" type="tel" required className="input-field" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <input name="age" type="number" required className="input-field" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
                <select name="gender" required className="input-field" value={gender} onChange={e => setGender(e.target.value as any)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>
            </div>
            <input name="password" type="password" required className="input-field" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <input name="confirmPassword" type="password" required className="input-field" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <style>{`.input-field { appearance: none; display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; placeholder-color: #6B7280; color: #111827; } .input-field:focus { outline: none; box-shadow: 0 0 0 2px #3182CE; border-color: #3182CE; }`}</style>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div>
            <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-brand-gray-dark">
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </div>
        <div className="text-center text-sm">
            <button type="button" onClick={toggleForm} className="font-medium text-brand-blue hover:text-brand-blue-dark">
                Already have an account? Sign In
            </button>
        </div>
    </form>
  );


  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center">
             <svg className="h-12 w-12 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-blue-dark">
            {isRegistering ? 'Create Your Account' : 'Welcome to NexSched'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering ? 'Join us to manage your dental health' : 'Sign in to your account'}
          </p>
        </div>
        {isRegistering ? renderRegisterForm() : renderLoginForm()}
      </div>
    </div>
  );
};

export default LoginPage;