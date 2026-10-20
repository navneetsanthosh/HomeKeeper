import { useNavigate } from 'react-router-dom';
import AuthScreen from './AuthScreen';

export default function Register(props) {
  const navigate = useNavigate();

  return (
    <AuthScreen
      {...props}
      isSigningUp
      onToggleMode={() => navigate('/login')}
    />
  );
}
