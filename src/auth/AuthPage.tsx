import { useState, type FormEvent } from 'react';
import { Activity, ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getAuthErrorMessage } from './authErrors';
import { registerWithEmail, sendPasswordReset, signInWithEmail, signInWithGoogle } from './authService';
import { getPasswordRequirements, isPasswordValid } from './passwordPolicy';

type AuthMode = 'signin' | 'register' | 'forgot';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const { user, configured, startupError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) return <Navigate to="/app" replace/>;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (!isPasswordValid(password)) {
        setError('Meet every password requirement before creating your account.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'register') await registerWithEmail(email, password, confirmPassword);
      else if (mode === 'signin') await signInWithEmail(email, password);
      else {
        await sendPasswordReset(email);
        setSuccess('If an account uses that email, Firebase has sent a password reset link.');
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setBusy(false);
    }
  };

  const requirements = getPasswordRequirements(password);
  const title = mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Sign in to continue';
  const description = mode === 'register'
    ? 'Create a secure account for your mechanical design workspace.'
    : mode === 'forgot'
      ? 'We’ll send a password reset link if this address has an account.'
      : 'Access your mechanical design workspace.';

  return <main className="login-screen"><div className="login-grid"><section className="login-story"><div className="brand login-brand"><div className="brand-mark"><Activity size={21}/></div><div><strong>MECHCALC</strong><small>ENGINEERING SUITE</small></div></div><div className="login-story-copy"><div className="eyebrow">MECHANICAL DESIGN WORKSPACE</div><h1>Good engineering<br/>starts with clarity.</h1><p>One focused space for fit checks, fastener estimates and fabrication geometry.</p><div className="login-blueprint"><div className="blueprint-circle"/><div className="blueprint-cross">⌖</div><span>Ø 25 H7</span><small>DESIGN / VERIFY / DOCUMENT</small></div></div><footer>MECHCALC · ENGINEERING DESIGN TOOLS</footer></section><section className="login-panel"><div className="login-form"><div className="login-symbol">{mode==='forgot'?<KeyRound size={20}/>:<Activity size={20}/>}</div><div className="eyebrow">{mode==='register'?'NEW ACCOUNT':mode==='forgot'?'ACCOUNT RECOVERY':'WELCOME BACK'}</div><h2>{title}</h2><p>{description}</p>
    {!configured&&<div className="auth-alert" role="alert"><ShieldCheck size={16}/><span>Firebase is not connected yet, so account creation and sign-in cannot be saved. Add the six VITE_FIREBASE values from your Firebase web app to .env, enable Email/Password and Google sign-in in Firebase Authentication, then restart Vite. Firebase stores user accounts and manages passwords; this app never saves passwords itself.</span></div>}
    {startupError&&<div className="auth-alert error" role="alert">{startupError}</div>}
    {error&&<div className="auth-alert error" role="alert">{error}</div>}
    {success&&<div className="auth-alert success" role="status">{success}</div>}
    <form onSubmit={submit}>
      <label className="field"><span>Email address</span><div className="auth-input-wrap"><Mail size={16}/><input className="login-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="engineer@company.com" autoComplete="email" required/></div></label>
      {mode!=='forgot'&&<label className="field"><span>Password</span><div className="auth-input-wrap"><KeyRound size={16}/><input className="login-input" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode==='register'?'new-password':'current-password'} minLength={mode==='register'?8:undefined} required/><button type="button" className="password-toggle" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>}
      {mode==='register'&&<><label className="field"><span>Confirm password</span><div className="auth-input-wrap"><KeyRound size={16}/><input className="login-input" type={showConfirm?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Enter your password again" autoComplete="new-password" required/><button type="button" className="password-toggle" aria-label={showConfirm?'Hide confirmation password':'Show confirmation password'} onClick={()=>setShowConfirm(!showConfirm)}>{showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label><div className="password-requirements" aria-label="Password requirements"><b>Password requirements</b>{requirements.map(item=><div className={item.met?'requirement met':'requirement'} key={item.id}>{item.met?<Check size={13}/>:<span className="requirement-dot"/>}{item.label}</div>)}<div className={confirmPassword&&confirmPassword===password?'requirement met':'requirement'}>{confirmPassword&&confirmPassword===password?<Check size={13}/>:<span className="requirement-dot"/>}Passwords match</div></div></>}
      {mode==='signin'&&<div className="forgot-link"><Link to="/forgot-password">Forgot password?</Link></div>}
      <button className="primary-button login-submit" type="submit" disabled={busy||!configured}>{busy?<><LoaderCircle className="spin" size={16}/>Working…</>:mode==='register'?'Create account':mode==='forgot'?'Send reset link':'Sign in'} <ArrowRight size={16}/></button>
    </form>
    {mode!=='forgot'&&<><div className="auth-divider"><span/>or<span/></div><button className="google-button" type="button" onClick={google} disabled={busy||!configured}><GoogleMark/>Continue with Google</button></>}
    <div className="auth-switch">{mode==='signin'?<>New to MechCalc? <Link to="/register">Create an account</Link></>:mode==='register'?<>Already have an account? <Link to="/login">Sign in</Link></>:<Link to="/login"><ArrowLeft size={13}/> Back to sign in</Link>}</div>
  </div><div className="login-panel-foot">FIREBASE AUTHENTICATION <span>·</span> SECURE SESSION</div></section></div></main>;
}

function GoogleMark(){return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.5 19.5 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"/></svg>}
