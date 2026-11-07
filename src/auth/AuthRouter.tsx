import { LoaderCircle } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import App from '../App';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthPage } from './AuthPage';

export function AuthRouter() {
  return <AuthProvider><BrowserRouter><AuthRoutes/></BrowserRouter></AuthProvider>;
}

function AuthRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading label="Restoring your secure session…"/>;

  return <Routes>
    <Route path="/" element={<Navigate replace to={user?'/app':'/login'}/>}/>
    <Route path="/login" element={user?<Navigate replace to="/app"/>:<AuthPage mode="signin"/>}/>
    <Route path="/register" element={user?<Navigate replace to="/app"/>:<AuthPage mode="register"/>}/>
    <Route path="/forgot-password" element={user?<Navigate replace to="/app"/>:<AuthPage mode="forgot"/>}/>
    <Route path="/app/*" element={<RequireAuth/>}/>
    <Route path="*" element={<Navigate replace to="/"/>}/>
  </Routes>;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading label="Restoring your secure session…"/>;
  return user ? <App/> : <Navigate replace to="/login" state={{from:location}}/>;
}

function AuthLoading({label}:{label:string}) {
  return <main className="auth-loading"><LoaderCircle className="spin" size={24}/><span>{label}</span></main>;
}
